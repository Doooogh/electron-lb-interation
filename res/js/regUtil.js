var regedit = require('regedit')
 
regedit.list('HKCU\\SOFTWARE', function(err, result) {
    ...
})
 
regedit.putValue({
    'HKCU\\SOFTWARE\\MyApp': {
        'Company': {
            value: 'Moo corp',
            type: 'REG_SZ'
        },
        'Version': { ... }
    },
    'HKLM\\SOFTWARE\\MyApp2': { ... }
}, function(err) {
    ...
})
 
regedit.createKey(['HKLM\\SOFTWARE\\Moo', 'HKCU\\SOFTWARE\\Foo'], function(err) {
    ...
})