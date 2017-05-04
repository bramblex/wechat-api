
// const parseString = require('xml2js').parseString
// const _ = require('lodash')

// parseString(`
// <error>
// 	<ret>0</ret>
// 	<message>OK</message>
// 	<skey>xxx</skey>
// 	<wxsid>xxx</wxsid>
// 	<wxuin>xxx</wxuin>
// 	<pass_ticket>xxx</pass_ticket>
// 	<isgrayscale>1</isgrayscale>
// </error>
// `, (err, result) => console.log(
//   _.mapValues(result.error, v => v[0])
//   ))

const {parseJsData} = require('../src/utils')

console.log(
	parseJsData('window.QRLogin.code = 200; window.QRLogin.uuid = "xxx"'),
	parseJsData('window.code=0; window.redirect_uri="https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?ticket=xxx&uuid=xxx&lang=xxx&scan=xxx";'),
	parseJsData('window.synccheck={retcode:"xxx",selector:"xxx"}')
)