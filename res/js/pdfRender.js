/**
 * Created by Edgar on 2014/6/17.
 */
function PdfRender(url, oCanvas, oPage, scope, sender, reader) {
    this.url = url;
    // this.oCanvas = oCanvas[0];
    this.oCanvas = oCanvas;
    this.oPage = oPage;
    this.scope = scope;
    this.sender = sender;
    this.reader = reader;

    this.pdfDoc = null;
    this.pageCount = 0;
    this.pageNo = 0;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.ctx = null;

    this.init = function() {
        var obj = this;
        obj.ctx = obj.oCanvas.getContext("2d");
        PDFJS.getDocument(obj.url).then(function (pdfDoc_) {
            obj.pdfDoc = pdfDoc_;
            obj.pageCount = obj.pdfDoc.numPages;
            obj.renderPage(1);
        });
    }

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    this.renderPage = function(num) {
        var obj = this;
        obj.pageRendering = true;
        var desiredWidth = obj.oCanvas.clientWidth;
        var desiredHeight = obj.oCanvas.clientHeight;
        // Using promise to fetch the page
        obj.pdfDoc.getPage(num).then(function(page) {
            var viewport = page.getViewport(1);
            // var scale = desiredWidth /viewport.width;
            var scale = desiredHeight /viewport.height;
            var scaledViewport = page.getViewport(scale);

            obj.oCanvas.width = scaledViewport.width;//
            obj.oCanvas.height = scaledViewport.height;//

            if(obj.oCanvas.parentElement.clientWidth - obj.oCanvas.width >0){
                obj.oCanvas.style.left = (obj.oCanvas.parentElement.clientWidth - obj.oCanvas.width)/2+"px";
            }

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: obj.ctx,
                viewport: scaledViewport
            };
            var renderTask = page.render(renderContext);

            // Wait for rendering to finish
            renderTask.promise.then(function () {
                //alert("pdf加载完成");
                initCanvas = obj.oCanvas;
                obj.pageRendering = false;
                if (obj.pageNumPending !== null) {
                    // New page rendering is pending
                    obj.renderPage(pageNumPending);
                    obj.pageNumPending = null;
                }
            });
        });

        // Update page counters
        obj.pageNo = num;
        hdkt_render_page(obj.oPage, obj.scope, obj.sender, obj.reader, obj.pageCount, num);
    }
    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    this.queueRenderPage = function(num) {
        var obj = this;
        if (obj.pageRendering) {
            obj.pageNumPending = num;
        } else {
            obj.renderPage(num);
        }
    }
}