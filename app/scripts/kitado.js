/*global Kitado */
(function(global) {
  'use strict';

  var KitadoSDK = function(){
    this.clientId = '';
  };

  KitadoSDK.prototype.init = function init (clientKey, cliendId) {
    console.log('kitado sdk inicializado');
    console.log('cpfs teste:','49764039200','02615093657');
    this.cliendId = cliendId;
    return "session-key";
  };

  KitadoSDK.prototype.debtor = function debtor(options, cb){
    options = options || {};
    console.log('debtor', options);
    var result = {};
    if (options.cpf != '02615093657'){
      result = {
        id: '99cfb3f7-a98a-42bb-924c-c1dc5a53f2bf',
        cpf: options.cpf,
        name: 'ADELVANE FERREIRA DA SILVA',
        total: 2723.51,
        debts: [{
          id: 1,
          label: 'Dívida Consolidada',
          itens: [
            {
              contract: 'Ctr.0730000143110322251/01',
              value: 466.80,
              description: 'CHEQUE ESPECIAL PARCELADO'
            },{
              contract: 'Ctr.0730010169043000152/01',
              value: 252.40,
              description: 'CHEQUE ESPECIAL BANE'
            },{
              contract: 'Ctr.2233000026090001287/01',
              value: 2004.31,
              description: 'CARTAO FLEX MASTERCA'
            }
          ],
          options: [
            {
              installments: 1,
              upfront: 0.0,
              value: 1946.19
            },{
              installments: 4,
              upfront: 0.0,
              value:  557.87
            },{
              installments: 12,
              upfront: 0.0,
              value: 193.41
            }
          ]
        }]
      };
    }
    cb(null, result);
  } 


  global.kitado = new KitadoSDK();
  var q = global.ki.q;
  global.ki = function ki() {
    var method = arguments[0], args = [];
    if(global.kitado[method]){
      for(var i=1; i < arguments.length; i++){ args.push(arguments[i])}
      //console.log(method, args);
      global.kitado[method].apply(kitado, args) 
    };
  };
  /* processa chamadas enfileiradas */
  while(q.length){
    var  i = q.shift();
    ki.apply(global, i);
  };
})(window);
