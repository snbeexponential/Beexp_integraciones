/**
 * @author Saul Navarro <saul.navarro@beexponential.com.mx>
 * @Name AC_CS_CALCULOPRECIOS.js
 * @description Script para cálculo de precios e impuestoe en Estimación y Pedidos.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

 define(['N/search', 'N/record', 'N/ui/dialog'], function (search, record, dialog) {

   const entry_point = {
      // lineInit: null,
      // sublistChanged: null,
      // validateField: null,
      /* validateInsert: null, */
      pageInit:null,
      validateLine: null,
      //fieldChanged: null,
      /* postSourcing: null, */
      saveRecord:null
      /* pageInit: null, */
      /* validateDelete: null, */
   };
   var categoria_cliente;
   var id_articulo;

    
       
   entry_point.saveRecord = function (context) {
/*       var cRecord =context.currentRecord
      
      
      cRecord.setCurrentSublistValue({
         sublistId: "item",
         fieldId: "discountitem",
         value: -6,
         ignoreFieldChange:true
      }) */
          return true;
          }









/*    entry_point.pageInit=function(Scriptcontext){
      console.group("PAGE INIT RECUPERANDO CAMPOS");
      console.log("init context",Scriptcontext)
      var currentRecord = Scriptcontext.currentRecord;
      categoria_cliente = currentRecord.getValue({
         fieldId: 'custbody_beex_az_catcliente'
      });
      console.log("categoria cliente",categoria_cliente)
      console.groupEnd();
   } */










   entry_point.validateLine = function (Scriptcontext) {
      var cRecord = Scriptcontext.currentRecord;
      var sublista = Scriptcontext.sublistId;
      console.group("VALIDATE LINE")
      if (sublista === 'item') {
         
         var descuento = cRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol2'
         });
       
         var descuento2 = cRecord.getValue({
            fieldId: "discounttotal"
         })

         cRecord.setValue({
            fieldId: 'discountrate',
            value: descuento+descuento2,
            ignoreFieldChange: true
         })
        
         cRecord.setValue({
            fieldId: 'discountitem',
            value: -6,
            ignoreFieldChange: true
         })

         
         var descuento3 = cRecord.getValue({
            fieldId: "discounttotal"
         })
         
      }
      console.log("Descuento del descuetno",typeof(descuento3))
      console.groupEnd()
      return true;
   }



   entry_point.fieldChanged=function(Scriptcontext) {
      var cRecord = Scriptcontext.currentRecord;
      var sublistId = Scriptcontext.sublistId;
      var fieldId = Scriptcontext.fieldId;
      var linenum = Scriptcontext.line;
      var columnid = Scriptcontext.column;
      
      /* var unidad =  */

      try {
         if(fieldId==="custbody_beex_az_catcliente"){
            categoria_cliente = cRecord.getValue({
            fieldId: 'custbody_beex_az_catcliente'
                   });
            console.log("Categoria cliente",categoria_cliente)
         }

         if (sublistId ==="item" && fieldId ==="item") {
            id_articulo =cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'item'
           });
         }

         if(id_articulo&&categoria_cliente){
            console.group("DATOS DE LA BUSQUEDA DESCUENTO")
            var porcentaje_desc=obtenerporcentaje(categoria_cliente,id_articulo);
            console.log("CATEGORIA",categoria_cliente)            
            console.log("ID ARTICULO",id_articulo)
            console.log("RESULTADO",porcentaje_desc)
            console.groupEnd()
         }
 
          if (fieldId === 'custcol_bex_az_precioacordado' || fieldId === 'quantity' || fieldId === 'taxrate1') {
              //Asignacion del amount
              var precioAc = cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'custcol_bex_az_precioacordado'
           });
         var cantidad = cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'quantity'
           });
           cRecord.setCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'amount',
               value: precioAc*cantidad,
               ignoreFieldChange: true,
               forceSyncSourcing: true
            });

            //Asignacion del importe IEPS(si es que el producto tiene)
         var ieps = cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'custcol_bex_az_iepstransac'
           });
         var amoun = cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'amount'
           });
         var rate = cRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate'
        }); 
           cRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol2',
            value: porcentaje_desc,
            ignoreFieldChange: true,
            forceSyncSourcing: true
           })
          cRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_bex_az_preciocalculado',
            value:(rate-(porcentaje_desc*rate)),
            ignoreFieldChange: true,
            forceSyncSourcing: true
           })
          cRecord.setCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'custcol_bex_az_importeieps',
               value: (amoun)*(1+(ieps*.01)),
               ignoreFieldChange: true,
               forceSyncSourcing: true
            });

            //Asignacion del importe del impuesto
           var taxrat = cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'taxrate1'
           });
           var impIEPS = cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'custcol_bex_az_importeieps'
           });
           cRecord.setCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'tax1amt',
               value: (impIEPS)*(taxrat*.01),
               ignoreFieldChange: true,
               forceSyncSourcing: true
            });
            //Asignacion del importe bruton
            cRecord.getCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'tax1amt'
           });
            cRecord.setCurrentSublistValue({
               sublistId: 'item',
               fieldId: 'grossamt',
               value: impIEPS+impImpuesto,
               ignoreFieldChange: true,
               forceSyncSourcing: true
            });

          }


          return true;
      }
      catch (e) {
          log.error({
              title: e.name,
              details: e.message
          });
      }
  }


function obtenerporcentaje(cat_disc,id_art) {
   console.log(cat_disc,id_art)
   var porcentaje =null;
   var customrecord_beex_az_descuentoxcatSearchObj = search.create({
      type: "customrecord_beex_az_descuentoxcat",
      filters:
      [
         ["custrecord_beex_az_artdes.internalid","anyof",id_art], 
         "AND",
         ["custrecord_beex_az_catdes.name","is",cat_disc]
      ],
      columns:
      [
         search_porcentaje =search.createColumn({name: "custrecord_beex_az_porcentaje", label: "Porcentaje Des"})
      ]
   });
   var searchResultCount = customrecord_beex_az_descuentoxcatSearchObj.runPaged().count;
   customrecord_beex_az_descuentoxcatSearchObj.run().each(function(result){
   porcentaje=result.getValue(search_porcentaje) 
   });
   return porcentaje
}
   return entry_point;
   
});