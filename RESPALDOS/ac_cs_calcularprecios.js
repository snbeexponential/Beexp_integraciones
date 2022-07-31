/**
 * @author Saul Navarro <saul.navarro@beexponential.com.mx>
 * @Name AC_CS_CALCULOPRECIOS.js
 * @description Script para cálculo de precios e impuestoe en Estimación y Pedidos.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

 define(["N/search", "N/record", "N/ui/dialog"], function (
  search,
  record,
  dialog
) {
  const entry_point = {
    pageInit: null,
    validateLine: null,
    saveRecord: null
  };
  var categoria_cliente;
  var id_articulo;
  var suma_descuentos = 0;
  var taxamount;
  var suma_grossamnt;

  entry_point.saveRecord = function (context) {
    return true;
  };

  entry_point.fieldChanged = function (Scriptcontext) {
    var cRecord = Scriptcontext.currentRecord;
    var sublistId = Scriptcontext.sublistId;
    var fieldId = Scriptcontext.fieldId;
    var linenum = Scriptcontext.line;
    var columnid = Scriptcontext.column;
    
    console.group("FIELD ID QUE SE EJECUTA FUERA")
    console.log(fieldId);
    console.groupEnd();

    try {
      if (fieldId === "custbody_beex_az_catcliente") {
        categoria_cliente = cRecord.getValue({
          fieldId: "custbody_beex_az_catcliente",
        });
      }

      if (sublistId === "item" && fieldId === "item") {
        id_articulo = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
        });
      }
      if (id_articulo && categoria_cliente) {
        var porcentaje_desc = obtenerporcentaje(categoria_cliente, id_articulo);
      }
      if (
        fieldId === "custcol_bex_az_precioacordado" ||
        fieldId === "quantity" ||
        fieldId === "taxrate1"
      ) {

        console.group("FIELD ID QUE SE EJECUTA DENTRO")
    console.log(fieldId);
    console.groupEnd();
        //Asignacion del amount
        var precioAc = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol_bex_az_precioacordado",
        });
        var cantidad = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
        });
        //TODO Valor del amount ->Posiblemente lo toma para el resumen
        cRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "amount",
          value: precioAc * cantidad,
          ignoreFieldChange: true,
          forceSyncSourcing: true,
        });

        //Asignacion del importe IEPS(si es que el producto tiene)
        var ieps = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol_bex_az_iepstransac",
        });
        var amoun = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "amount",
        });
        var rate = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "rate",
        });
        cRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol2",
          value: porcentaje_desc,
          ignoreFieldChange: true,
          forceSyncSourcing: true,
        });
        cRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol_bex_az_preciocalculado",
          value: rate - porcentaje_desc * rate,
          ignoreFieldChange: true,
          forceSyncSourcing: true,
        });
        console.group("Lo que trae el importe IEPS")
        console.log( "IMPORTE IEPS AMOUNTxIEPS",amoun * (1 + ieps * 0.01))
        console.groupEnd
        cRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol_bex_az_importeieps",
          value: amoun * (1 + ieps * 0.01),
          ignoreFieldChange: true,
          forceSyncSourcing: true,
        });

        //Asignacion del importe del impuesto
        var taxrat = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "taxrate1",
        });
        var impIEPS = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol_bex_az_importeieps",
        });
        
        console.log("Test de impuesto",taxrat*.01)
        console.log("Test de importe ieps",impIEPS)

        taxamount=impIEPS*(taxrat * 0.01)
        console.log("TAXAMOUNT",taxamount)

        if( fieldId!="taxrate1"){
          cRecord.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "tax1amt",
            value:taxamount,
            ignoreFieldChange: false,
            forceSyncSourcing: true,
          });
        }else{
          cRecord.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "tax1amt",
            value:taxamount,
            ignoreFieldChange: true,
            forceSyncSourcing: true,
          });
        }
        //Asignacion del importe bruto 
        var impImpuesto = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "tax1amt",
        });

        cRecord.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "grossamt",
          value: impIEPS+impImpuesto,
          ignoreFieldChange: true,
          forceSyncSourcing: true,
        });
      }
      //SUMATORIA DEL DESCUENTO
      //Forzamos la traida del descuento
      var descuento_field = cRecord.getCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol2",
      });
      //Se carga el valor de field pero no importa, el que nos sirve es el descuenr
      //este cuento ya se carga cuando el campo ha estado cargado
      suma_descuentos = 0;
      suma_grossamnt=0;
      if (sublistId === "item" && descuento_field) {
        //1.-Traer una línea que me el listado de los items
        //Contamos las líneas
        console.group("Contador de item");
        var item_count = cRecord.getLineCount({ sublistId: "item" });
        
        console.log("Cantidad de items", item_count);
        //2.-Traer las líneas del current
        for (var i = 0; i < item_count; i++) {

         
          

          if (i != linenum) {
            var subtotal_so = cRecord.getSublistValue({
              sublistId:"item",
              fieldId:"impIEPS",
              line:i
            })

            console.log("RESULTADO DEL SUBTOTAL",subtotal_so)

            var desc_item = cRecord.getSublistValue({
              sublistId: "item",
              fieldId: "custcol2",
              line: i,
            });
            suma_descuentos+=desc_item;
            suma_grossamnt+=subtotal_so
          }

        }

        var descuento = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "custcol2",
        });

        var tem_gross = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "grossamt",
        });

        suma_grossamnt+=tem_gross;
        console.log("RESULTADO DEL SUBTOTAL",suma_grossamnt)
        suma_descuentos+=descuento;
       
        console.groupEnd();

      }
      return true;
    } catch (e) {
      log.error({
        title: e.name,
        details: e.message,
      });
    }
  };

  entry_point.validateLine = function (Scriptcontext) {
    var cRecord = Scriptcontext.currentRecord;
    var sublista = Scriptcontext.sublistId;
    if (sublista === "item") {
      //Probando valores de suma
      //
      //
      //



/*       cRecord.setValue({
        fieldId: "estgrossprofit",
        value: suma_grossamnt,
        ignoreFieldChange: true,
      }); */

      cRecord.setValue({
        fieldId: "discountrate",
        value: suma_descuentos,
        ignoreFieldChange: true,
      });

      //Esta es una llave para poder cargarle el valor al resumen
      cRecord.setValue({
        fieldId: "discountitem",
        value: -6,
        ignoreFieldChange: true,
      });
    }

    
    return true;
  };

  function obtenerporcentaje(cat_disc, id_art) {
    console.log(cat_disc, id_art);
    var porcentaje = null;
    var customrecord_beex_az_descuentoxcatSearchObj = search.create({
      type: "customrecord_beex_az_descuentoxcat",
      filters: [
        ["custrecord_beex_az_artdes.internalid", "anyof", id_art],
        "AND",
        ["custrecord_beex_az_catdes.name", "is", cat_disc],
      ],
      columns: [
        (search_porcentaje = search.createColumn({
          name: "custrecord_beex_az_porcentaje",
          label: "Porcentaje Des",
        })),
      ],
    });
    var searchResultCount =
      customrecord_beex_az_descuentoxcatSearchObj.runPaged().count;
    customrecord_beex_az_descuentoxcatSearchObj.run().each(function (result) {
      porcentaje = result.getValue(search_porcentaje);
    });
    return porcentaje;
  }
  return entry_point;
});