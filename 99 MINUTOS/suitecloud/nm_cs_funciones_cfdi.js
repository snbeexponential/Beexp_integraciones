/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

   define(["N/url", "N/currentRecord", "N/https"], function (
    url,currentRecord,https) {
      try{
        function solcitandoinvoice(id) {  
        alert("Se está ejecutando la generación del CFDI "+id)

          var params=({
              internalId:id
          })
          var suiteletURL = url.resolveScript({
            scriptId: "customscript_nm_rl_invoice",
            deploymentId: "customdeploy__nm_rl_invoice",
          }); 
          var respon = https.post({
            url:suiteletURL,
            body:params
          });

          log.debug("hola estamos haciendo proceos ",respon)

        }



        function solcitandoCreditMemo(id) {  
          alert("Se está ejecutando la generación del CFDI "+id)
  
 /*            var params=({
                internalId:id
            })
            var suiteletURL = url.resolveScript({
              scriptId: "customscript_nm_rl_invoice",
              deploymentId: "customdeploy__nm_rl_invoice",
            }); 
            var respon = https.post({
              url:suiteletURL,
              body:params
            });
  
            log.debug("hola estamos haciendo proceos ",respon) */
  
          }

          function solcitandoPayment(id) {  
            alert("Se está ejecutando la generación del CFDI "+id)
/*     
              var params=({
                  internalId:id
              })
              var suiteletURL = url.resolveScript({
                scriptId: "customscript_nm_rl_invoice",
                deploymentId: "customdeploy__nm_rl_invoice",
              }); 
              var respon = https.post({
                url:suiteletURL,
                body:params
              });
    
              log.debug("hola estamos haciendo proceos ",respon) */
    
            }
        function pageInit(){}
        
        return {
          pageInit: pageInit,
          solcitandoCreditMemo: solcitandoCreditMemo,
          solcitandoPayment: solcitandoPayment,
          solcitandoinvoice: solcitandoinvoice,
        };
      }
      
      catch(error){
        log.debug('Error', error)
      }
    });