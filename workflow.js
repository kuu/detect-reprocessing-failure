var casper = require('casper').create();
var url = casper.cli.args[0];
var result;

function getResult() {
  var tbody = document.querySelector('#workflows');
  return tbody.children[0].id.replace('workflow_', '');
}

casper.start();
casper.open(url);
casper.then(function () {
  result = this.evaluate(getResult);
});
casper.on('error', function(msg){
  result = '';
});
casper.run(function () {
  this.echo(result);
  this.exit();
});
