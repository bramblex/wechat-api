
const parseString = require('xml2js').parseString
const _ = require('lodash')

parseString(`
<error>
	<ret>0</ret>
	<message>OK</message>
	<skey>xxx</skey>
	<wxsid>xxx</wxsid>
	<wxuin>xxx</wxuin>
	<pass_ticket>xxx</pass_ticket>
	<isgrayscale>1</isgrayscale>
</error>
`, (err, result) => console.log(
  _.mapValues(result.error, v => v[0])
  ))