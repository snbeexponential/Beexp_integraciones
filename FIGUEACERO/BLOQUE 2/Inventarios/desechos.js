/**
 * @author Saul Navarro<saul.navarro@beexponential.com.mx>
 * @Name FA_rl_directions.js
 * @description Script para obtener, crear y actualizar direcciones de clientes en figueacero
 * @file fa_customers.xlsx <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 define([
    'N/log',
    'N/record',
    'N/runtime',
    "N/search",
    "N/format"
],
function(log, record, runtime,search,format) {

    const entry_point = {
        get: null,
        post: null,
        put: null
    };
    
    const response = {
        code: 200,
        message: "",
        result:[]
    };
    //Formato de JSON usado en el get
    const directiondata={
        internalid:null,
        addressbook:[{
            addressbookaddress:null
        }]
    }

    entry_point.get = function(request) {         
        

        var inventoryitemSearchObj = search.create({
            type: "inventoryitem",
            filters:
            [
               ["isinactive","is","F"], 
               "AND", 
               ["type","anyof","InvtPart"], 
               "AND", 
               ["internalid","anyof","29655"], 
               "AND", 
               ["inventorydetail.binnumber","anyof","1637"]
            ],
            columns:
            [
               search_lote=search.createColumn({
                  name: "inventorynumber",
                  join: "inventoryDetail",
                  label: "Number"
                }),
                search_disponible=search.createColumn({
                    name: "quantity",
                    join: "inventoryDetail",
                    label: "Quantity"
                 })
            ]
         });
         
         var searchResultCount = inventoryitemSearchObj.runPaged().pageRanges;
         var pagedData2=inventoryitemSearchObj.runPaged({"pageSize":1000});
         log.debug("si jala");
         for (let i = 0; i< pagedData2.pageRanges.length; i++) {
            var currentpage2 = pagedData2.fetch(i);
            currentpage2.data.forEach(function(result){
                response.result.push({
                    datitos:result.getValue(search_lote),
                    valores:result.getText(search_lote),
                    disponible:result.getValue(search_disponible)
                }
                )
            }
            )
         }

         return response;



    }

    entry_point.post = function(request) {
        return true;
    }

    entry_point.put = (request) => {
            return true
    }

    return entry_point;
});
