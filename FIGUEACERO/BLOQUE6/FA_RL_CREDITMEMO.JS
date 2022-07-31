/**
 * @author Carlos Flores <carlos.flores@beexponential.com.mx>
 * @Name fa_devoluciones_creditMemo.js
 * @description 
 * @fecha 16/10/2021
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

 define(['N/record', 'N/search', 'N/format'], function (record, search, format) {
    const entry_point = {
        get: null,
        post: null,
        put: null,
        delete: null
    };    
    const response = {
        code: 200,
        message: "",
        result: {}
    };
 
    entry_point.post = (context) => {

        var contexto = JSON.parse(JSON.stringify(context));

        try {
           
            var rec = record.transform({
                fromType: record.Type.INVOICE,
                fromId: contexto.invoiceId,
                toType: record.Type.CREDIT_MEMO,
                isDynamic: true
            });

            var lineas = rec.getLineCount({ sublistId: 'item' }); 
            
            for (var i=lineas-1; i>=0; i--){                
                rec.removeLine({sublistId: 'item', line: i, ignoreRecalc: true});
            } 
            
            rec.setValue({ fieldId: 'trandate', value: new Date(contexto.date) });
            
            contexto.item.forEach(element => {
                rec.selectNewLine({sublistId: 'item'});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'item',value: element.item});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'quantity',value: element.quantity});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'taxcode',value: 106});
                rec.setCurrentSublistValue({sublistId: 'item',fieldId: 'amount',value:element.amount * element.quantity});                
                rec.commitLine({ sublistId: 'item'});
            });       
            
            var calculateTax = rec.getMacro({id: 'calculateTax'});
            calculateTax();

            var idNotaCreditoNueva = rec.save({ignoreMandatoryFields: true});

            response.code = 200;
            response.message = "Nota de crédito creada con éxito";
            response.result = {"id": idNotaCreditoNueva};
                 
        } catch (error){
            response.code = 400;
            response.message = error.message;
        }
            
        return response;
    }
    entry_point.get = (context) => { return 'get'; }
    entry_point.put = (context) => { return 'put'; }
    entry_point.delete = (context) => { return 'delete'; }
    return entry_point;
});


