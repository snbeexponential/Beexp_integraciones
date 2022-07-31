/**
 * @author Carlos Flores <carlos.flores@beexponential.com.mx>
 * @Name FA|R|CONSULTA VENTA (customscript_fa_r_consulta_venta)
 * @description Consulta una venta de corte de placa o venta concretada en Netsuite.
 * @fecha 11/10/2021
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 define(['N/record', 'N/search'], function (record, search) {
    const entry_point = {
        get: null,
        post: null,
        put: null,
        delete: null
    };

    const response = {
        code: 200,
        message: "",
        result:[
        ]
    };


    //PROBAR CON 7444 y 7445

    entry_point.get = (context) => {
        try {

            //var objRecord = record.load({ type: record.Type.SALES_ORDER, id: context.id, isDynamic: true });
            //return objRecord;
            
            var resultado = [];
            var salesorderSearchObj = search.create({
                type: "invoice",
                filters:[
                    ["internalid", "anyof", context.id], "AND",
                    ["type", "anyof", "CustInvc"], "AND",
                    ["mainline", "any", ""], "AND",                    
                    ["item.type", "anyof", "@NONE@", "InvtPart", "NonInvtPart"], "AND",
                    ["type", "noneof", "TaxPymt"]
                ], columns:[
                    ///search.createColumn({ name: "total", label: "Amount (Transaction Total)" }),
                    search_internalid =search.createColumn({ name: "internalid", join: "customer", label: "Internal ID" }),
                    search_subsidiary =search.createColumn({ name: "subsidiary", label: "Subsidiary" }),                     
                    search_trandate =search.createColumn({ name: "trandate", sort: search.Sort.ASC, label: "Date" }),
                    search_item =search.createColumn({ name: "item", label: "Item" }),
                    search_amount =search.createColumn({ name: "amount", label: "Amount" }),                        
                    search_discountamount =search.createColumn({ name: "discountamount", label: "Amount Discount" }),
                    search_taxamount =search.createColumn({ name: "taxamount", label: "Amount (Tax)" }),
                    search_netamount =search.createColumn({ name: "netamount", label: "Amount (Net)" }),                    
                    search_type =search.createColumn({ name: "type", join: "item", label: "Type" }),
                    search_quantity =search.createColumn({ name: "quantity", label: "Quantity" })                  
                ]
            });

            var searchResultCount = salesorderSearchObj.runPaged().count;
            if(searchResultCount>0 || searchResultCount==null){
                
                let record_items = record.load({
                    type: record.Type.INVOICE,
                    id: context.id,
                    isDynamic: true,
                })


            }else{
                



            }

            log.debug("salesorderSearchObj result count", searchResultCount);            
            salesorderSearchObj.run().each(function (result) {
            


             /*    response.result.push({
                    entity:result.getValue(search_internalid),
                    subsidiary:result.getText(search_subsidiary),
                    fecha:result.getValue(search_trandate),
                    subtotal:result.getValue(search_amount),
                    discount:result.getValue(search_discountamount),
                    tax:result.getValue(search_taxamount),
                    total:result.getValue(search_netamount)
                })
        
                var item= []; */

                    item.push({
                        item:     result.getValue({name:'item'}),
                        description: result.getText({name:'item'}),
                        quantity:   result.getValue({name:'quantity'}),
                        amount:     result.getValue({name:'amount'}),
                        discount:   result.getValue({name:'discountamount'}),
                        tax:        result.getValue({name:'taxamount'}),
                        total:      result.getValue({name:'netamount'})                        
                    });
             
            }); 
        } catch (error) {
            response.code = 400;
            response.message = response.message = error.message;
        }
        return response;
    }
    entry_point.post = (context) => { return 'post'; }
    entry_point.put = (context) => { return 'put'; }
    entry_point.delete = (context) => { return 'delete'; }
    return entry_point;
});
