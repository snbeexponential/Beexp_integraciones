/**
 * @author ashanty.uh@beexponential.com.mx
 * @Name be_c_sum_lots.js
 * @description 
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/search','N/format','N/record','N/ui/dialog',],function(search,format,record,dialog){
    return {        
        fieldChanged: function(context){
            var currentRecord   = context.currentRecord; 
            var sublist         = 'inventoryassignment';
            var available       = currentRecord.getValue("quantity"); 
            var lines           = currentRecord.getLineCount({sublistId: sublist});
            var totalQuantity   = 0;
            if(context.sublistId===sublist && context.fieldId=='quantity') {
                var newQuantity = currentRecord.getCurrentSublistValue({sublistId: sublist,fieldId: 'quantity',line: context.line}); //Nuevo valor entrante
                var band = false; //No se esta editando
                //console.log("NUEVA CANTIDAD",newQuantity);
                if(newQuantity > available) {
                    currentRecord.setCurrentSublistValue({ 
                        sublistId: sublist, 
                        fieldId: 'quantity',  
                        line: context.line,
                        value: '',
                        ignoreFieldChange: true
                    });
                    dialog.alert({
                        title: 'Lotes: ',
                        message: 'La cantidad total del detalle de inventario debe ser '+available
                    });
                    return false;
                } else {
                    //console.log("LINITAS",context.line, lines); 
                    var contenido = new Array();
                    for (var i = 0; i < lines; i++) { 
                        console.log("-",context.line,i);
                        if(i == context.line) { //Sustituye valor si se esta editando
                            //console.log("SE ESTA EDITANDO");
                            currentRecord.selectLine({ sublistId: sublist, line: context.line });
                            currentRecord.setCurrentSublistValue({ //Envía el total de la línea
                                sublistId: sublist, 
                                fieldId: 'quantity',  
                                line: context.line,
                                value: newQuantity,
                                ignoreFieldChange: true
                            });
                            band = true;
                            contenido[i] = newQuantity;
                        } else {
                            var quantityLine = currentRecord.getSublistValue({
                                sublistId: sublist,
                                fieldId: 'quantity',
                                line: i
                            });
                            contenido[i] = quantityLine;
                        }
                        
                    }
                    // for (var i = 0; i < lines; i++) { 
                    //     var quantityLine = currentRecord.getSublistValue({
                    //         sublistId: sublist,
                    //         fieldId: 'quantity',
                    //         line: i
                    //     });
                    //     contenido[i] = quantityLine;
                    //     totalQuantity = totalQuantity + quantityLine; //Valor de la suma de las líneas existentes
                    // }
                    // console.log("CANTIDAD",totalQuantity);
                    for(var i = 0; i <= contenido.length; i++) {
                        if(contenido[i]) {
                            totalQuantity = totalQuantity + contenido[i];

                        }
                    }
                    if(band != true) {
                        totalQuantity = totalQuantity + newQuantity;
                        console.log(totalQuantity);
                        if(totalQuantity <= available) {
                            var newTotalQuantity = available - totalQuantity;
                            dialog.alert({
                                title: 'Lotes: ',
                                message: 'La cantidad total del detalle de inventario debe ser '+newTotalQuantity
                            });
                        } else {
                            dialog.alert({
                                title: 'Lotes: ',
                                message: 'La cantidad total del detalle de inventario debe ser '+available
                            });
                            currentRecord.cancelLine({ sublistId: sublist, line: context.line });
                        } 
                    } else { //SE ESTA EDITANDO
                        if(totalQuantity <= available) {
                            var newTotalQuantity = available - totalQuantity;
                            dialog.alert({
                                title: 'Lotes: ',
                                message: 'La cantidad total del detalle de inventario debe ser '+newTotalQuantity
                            });
                            // currentRecord.setCurrentSublistValue({ 
                            //     sublistId: sublist, 
                            //     fieldId: 'quantity',  
                            //     line: context.line,
                            //     value: '',
                            //     ignoreFieldChange: true
                            // });
                        } else {
                            dialog.alert({
                                title: 'Lotes: ',
                                message: 'La cantidad total del detalle de inventario debe ser '+available
                            });
                            currentRecord.selectLine({ sublistId: sublist, line: context.line });
                            // currentRecord.setCurrentSublistValue({ 
                            //     sublistId: sublist, 
                            //     fieldId: 'quantity',  
                            //     line: context.line,
                            //     value: '',
                            //     ignoreFieldChange: true
                            // });
                            currentRecord.removeLine({
                                sublistId: sublist,
                                line: context.line,
                                ignoreRecalc: true
                            });
                        } 
                    }                   
                }
            }
        }   
    }

});