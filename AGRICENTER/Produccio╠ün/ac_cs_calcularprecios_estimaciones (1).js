/**
 * @author Saul Navarro <saul.navarro@beexponential.com.mx>
 * @Name AC_CS_CALCULOPRECIOS.js
 * @description Script para cálculo de precios e impuestoe en Estimación y Pedidos.
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

 define(["N/search", "N/record", "N/ui/dialog", 'N/runtime','N/email'], function (
  search,
  record,
  dialog,
  runtime,
  email
) {
  const entry_point = {
    pageInit: null,
    validateLine: null,
    saveRecord: null
  };

  //Inicializamos variables
  var categoria_cliente;
  var id_articulo;
  var suma_descuentos = 0;
  var taxamount,taxamount2;
  var suma_grossamnt;

  entry_point.saveRecord = function (Scriptcontext) {
/*     var cRecord = Scriptcontext.currentRecord;
    var countValido=0;

    var items = cRecord.getLineCount({
      sublistId: 'item'
  });

  for (var j = 0; j < items; j++) {  
    const isValido = objRecord.getSublistValue({
      sublistId: 'item',
      fieldId: 'custcolconfirma_venta_menor',
      line: j
  });
    if(isValido!="F"||isValido!="V"){
      alert("No se pudo guardar la orden de venta, el valor de Autorización es incorrecto, debe ser un valor (F ó V)");
    return false
    }else{
      if (isValido=="F") {
        countValido++
      }
    }

  }

  if (countValido>0) {
    log.debug({
      title: "Se envía correo, pero no se realiza el consumo de Script",
      details: countValido
    })
  } */

    return true;
  };


  entry_point.fieldChanged = function (Scriptcontext) {

    var cRecord = Scriptcontext.currentRecord;
    var sublistId = Scriptcontext.sublistId;
    var fieldId = Scriptcontext.fieldId;
    var linenum = Scriptcontext.line;
    var columnid = Scriptcontext.column;
    var user_info = runtime.getCurrentUser();
    var role_user = user_info.role;
    console.log(role_user)
    try {

      //1.-Recuperamos el valor de la categoría del cliente para luego ubicar el porcentaje
      if(categoria_cliente){
        console.log(categoria_cliente,"TRUE")
      }else{
        console.log(categoria_cliente,"False")
        categoria_cliente=cRecord.getValue({
          fieldId: "custbody_beex_az_catcliente",
        });
      }
      /* categoria_cliente = obtenerCategoria() */
 
   /*    if (fieldId === "custbody_beex_az_catcliente" ) {
        categoria_cliente = cRecord.getValue({
          fieldId: "custbody_beex_az_catcliente",
        });
      } */

      //2.-Requerimos el Id del artículo
      /* && fieldId === "item" */
      if (sublistId === "item" ) {
        id_articulo = cRecord.getCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
        });
      }

      //3.-Si temeos los dos campos entonces ejecutamos la busqueda que traiga el porcentaje de descuento
      if (id_articulo && categoria_cliente) {
        var porcentaje_desc = obtenerporcentaje(categoria_cliente, id_articulo);
      }
      
//---------------------------------------------iniciamos operaciones de calculo de precio------------------------------------
      if (
        fieldId === "custcol_bex_az_precioacordado"||
        fieldId === "quantity" ||
        fieldId === "taxrate1" ||
        fieldId === "price" ||
        fieldId === "custcol_bex_az_importeieps"||
        fieldId === "custcolconfirma_venta_menor"
      ) {

    //1.- Recuperamos el precio acordado del context
    var precioAc =  cRecord.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "custcol_bex_az_precioacordado",
    });
      
    //2.- Recuperamos la cantidad de articulos context
    var cantidad = cRecord.getCurrentSublistValue(
      {
      sublistId: "item",
      fieldId: "quantity",
    });
  
    //3.- Cargamos en el campo amount el valor del precio acordado por la cantidad de articulos a cargar
    
   
    var amount_res=precioAc*cantidad


    //4.-Recuperamos el campo ieps
    var ieps = cRecord.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "custcol_bex_az_iepstransac",
      });
      
    //5.- Recuperamos el campo amount despues de haberle cargado el valor antes
      var amount = amount_res
     /*  cRecord.getCurrentSublistValue({
        sublistId: "item",
        fieldId: "amount",
      }); */
    //6.-Recuperamos el valor rate= valor del precio original
    var rate = cRecord.getCurrentSublistValue({  
      sublistId: "item",
      fieldId: "rate",
    });

    //7.-Mandamos el precio del porcentaje de descuento a la tabla
    if (porcentaje_desc) {
      
      cRecord.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol2",
        value:porcentaje_desc,
        ignoreFieldChange: true,
        forceSyncSourcing: true,
      });
      cRecord.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol_bex_az_preciocalculado",
        value:rate-(porcentaje_desc*rate),
        ignoreFieldChange: true,
        forceSyncSourcing: true,
      });
    }else{
      cRecord.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol2",
        value:0,
        ignoreFieldChange: true,
        forceSyncSourcing: true,
      });
      //Comentario
      cRecord.setCurrentSublistValue({
        sublistId: "item",
        fieldId: "custcol_bex_az_preciocalculado",
        value:0,
        ignoreFieldChange: true,
        forceSyncSourcing: true,
      });
    }
    //Validamos que el precio acordado no sea menor al precio minimo
    var preciocalculado=cRecord.getCurrentSublistValue({  
      sublistId: "item",
      fieldId: "custcol_bex_az_preciocalculado",
    });

    log.debug({
      title: "role_user",
      details:role_user
    })

    var venta_autorizada=cRecord.getCurrentSublistValue({  
      sublistId: "item",
      fieldId: "custcolconfirma_venta_menor",
    });
    //Role users
    //3=Administrador
    //1004=Agricenter - Jefe de sucursal
    //1001=Agricenter-Administrador de ventas

      if (precioAc>0&&precioAc<preciocalculado) {
        if (role_user == 3 && venta_autorizada=="V"
        || role_user == 3 && venta_autorizada=="v"
        || role_user == 1004 && venta_autorizada=="V"
        || role_user == 1004 && venta_autorizada=="v"
        || role_user == 1001 && venta_autorizada=="V"
        || role_user == 1001 && venta_autorizada=="v") {
          if( fieldId!="custcolconfirma_venta_menor"){
            cRecord.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "custcolconfirma_venta_menor",
              value:"V",
              ignoreFieldChange: false,
              forceSyncSourcing: true,
            });
          }else{
            alert("Como Administrador estás autorizando que en esta venta el precio Acordado sea menor al Precio con Descuento");
            cRecord.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "custcolconfirma_venta_menor",
              value:"V",
              ignoreFieldChange: true,
              forceSyncSourcing: true,
            });
          } 
        }else{
        //Validando campo falso
        if( fieldId!="custcolconfirma_venta_menor"){
          cRecord.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "custcolconfirma_venta_menor",
            value:"F",
            ignoreFieldChange: false,
            forceSyncSourcing: true,
          });
        }else{
          alert("El precio acordado es menor al precio calculado, se asigna el item como No Autorizado(F)");
          cRecord.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "custcolconfirma_venta_menor",
            value:"F",
            ignoreFieldChange: true,
            forceSyncSourcing: true,
          });
        } 
        }
      }else{
        //Validando campo verdadero
        if( fieldId!="custcolconfirma_venta_menor"){
          cRecord.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "custcolconfirma_venta_menor",
            value:"V",
            ignoreFieldChange: false,
            forceSyncSourcing: true,
          });
        }else{
          cRecord.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "custcolconfirma_venta_menor",
            value:"V",
            ignoreFieldChange: true,
            forceSyncSourcing: true,
          });
        }
      }
    
    


    
    //8.-Mandamos el precio con el descuento aplicado
    
    //9.-Le pasamos al valor del importe ieps el valor correspondiete a la operacion:
    var importe_ieps= amount_res * (1+(ieps* 0.01))
    //Posblemente se requiera actualizar el dato que le estamos pasando
    
    
    //10.-Recuperamos el valor del taxrate es decir del valor del iva
    var taxrat = cRecord.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "taxrate1",
    });
    //11.-Ahora recuperamos el valor que le dimos en el caso anterior al importe de ieps, viene siendo el mismo que está en
    //importe_ieps
    
    
    cRecord.setCurrentSublistValue({
      sublistId: "item",
      fieldId: "amount",
      value:importe_ieps.toFixed(2),
      ignoreFieldChange: true,
      forceSyncSourcing: true,
    });
    
    cRecord.setCurrentSublistValue({
      sublistId: "item",
      fieldId: "custcol6",
      value:amount_res.toFixed(2),
      ignoreFieldChange: true,
      forceSyncSourcing: true,
    });
    
    
      //12.-Aquí ya tenemos el tax amount 
      //v1-Normal
          taxamount=importe_ieps*(taxrat * 0.01)
  
      //v2-Agregando el valor del ieps pero quitandolo del total
          taxamount2=((importe_ieps+taxamount)-amount)


          //V2-Revisar si esto aplica al resto de los campos que se cargan en formato lista
          if( fieldId!="tax1amt"){
            cRecord.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "tax1amt",
              value:taxamount.toFixed(1),
              ignoreFieldChange: false,
              forceSyncSourcing: true,
            });
          }else{
            cRecord.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "tax1amt",
              value:taxamount.toFixed(1),
              ignoreFieldChange: true,
              forceSyncSourcing: true,
            });
          }
          //V2-Revisar si esto aplica al resto de los campos que se cargan en formato lista
/*           if( fieldId!="custcol_bex_az_precioacordado"){
            cRecord.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "custcol_bex_az_precioacordado",
              value:precioAc,
              ignoreFieldChange: false,
              forceSyncSourcing: true,
            });
          }else{
            cRecord.setCurrentSublistValue({
              sublistId: "item",
              fieldId: "custcol_bex_az_precioacordado",
              value:precioAc,
              ignoreFieldChange: true,
              forceSyncSourcing: true,
            });
          } */



    }
      return true;
    } catch (e) {
      log.debug({
        title: e.name,
        details: e.message,
      });
    }
  };

  entry_point.validateLine = function (Scriptcontext) {
    return true;
  };
/*   function obtenerCategoria(){
   let cat = cRecord.getCurrentSublistValue({
      sublistId: "item",
      fieldId: "custbody_beex_az_catcliente",
    });
    return cat
  } */

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
    var searchResultCount = customrecord_beex_az_descuentoxcatSearchObj.runPaged().count;
    customrecord_beex_az_descuentoxcatSearchObj.run().each(function (result) {
      porcentaje = result.getValue(search_porcentaje);
    });
    return porcentaje;
  }
  return entry_point;
});