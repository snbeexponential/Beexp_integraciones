/**
 * @author Saul Navarro<saul.navarro@beexponential.com.mx>
 * @Name fa_consulta_existencias.js
 * @description Script que obtiene las existencias de los artículos
 * @file fa_customers.xlsx <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 define(['N/log','N/record','N/runtime',"N/search","N/format"],
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
        
        filters = [];
        var id = request.id;
        if(id){
            filters.push(["internalidnumber", "equalto", id]);
        }else{
            filters.push([
                ["isinactive","is","F"],"AND",
                ["type","anyof","Discount","InvtPart","Group","Kit","NonInvtPart","Service"],"AND",
                ["internalid","noneof","@NONE@"]
                  ]);
        }
            var itemSearchObj = search.create({
                type: "item",
                filters:filters,
                columns:
                [
                   search.createColumn({
                      name: "itemid",
                      sort: search.Sort.ASC,
                      label: "Name"
                   }),
                   search_type=search.createColumn({name: "type", label: "Type"}),
                   search_id=search.createColumn({name: "internalid", label: "Internal ID"}),
                   search_lote=search.createColumn({name: "islotitem", label: "Is Lot Numbered Item"})
                ] 
             });

             


         //Multiples transacciones  

        var searchResultCount = itemSearchObj.runPaged().pageRanges;

        if (searchResultCount.length==0) {
             response.code=404
             response.message="No se encontraron coicidencias";
             return response;
        }
        
         

         var pagedData = itemSearchObj.runPaged({ "pa​g​e​S​i​z​e": 1000 });
         //pa​g​e​S​i​z​e
         var resulta2=0;
         try {
            for (var i = 0; i < pagedData.pageRanges.length; i++) {
                var currentPage = pagedData.fetch(i);
                    currentPage.data.forEach(function(result) {   
                        var ubicaciones = [];
                        var total_disp=0;
                        if(result.getValue(search_type)=="InvtPart"){

                            // INCIO UBICACIONES
var objRecord = record.load({type: record.Type.INVENTORY_ITEM,id:result.getValue(search_id),isDynamic: true});
var totalLines = objRecord.getLineCount({ sublistId: 'binnumber' });
for (let index = 0; index < totalLines; index++) {

    var bin_id=objRecord.getSublistValue({ sublistId: 'binnumber', fieldId: 'binnumber', line: index })
    var bin_number=objRecord.getSublistValue({ sublistId: 'binnumber', fieldId: 'binnumber_display', line: index })
    var disponible=objRecord.getSublistValue({ sublistId: 'binnumber', fieldId: 'onhandavail', line: index })
    var bin_fav=objRecord.getSublistValue({ sublistId: 'binnumber', fieldId: 'preferredbin', line: index })
    
    if (disponible==0||disponible==null){
        disponible=0;
    }
    
    //if(result.getValue(search_lote)=="InvtPart"
    
    //Inicio de los lotes

    
    var inventoryitemSearchObj = search.create({
        type: "inventoryitem",
        filters:
        [
            ["isinactive","is","F"], 
            "AND", 
            ["type","anyof","InvtPart"], 
            "AND", 
            ["internalid","anyof",result.getValue(search_id)], 
            "AND", 
            ["inventorydetail.binnumber","anyof",bin_id]
        ],
        
        columns:
        [
            search_id_lote=search.createColumn({
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
    
    for (let k = 0; k< pagedData2.pageRanges.length; k++) {
        var lote=[]
        var currentpage2 = pagedData2.fetch(k);
        currentpage2.data.forEach(function(result2){
            lote.push({
                loteid:result2.getValue(search_id_lote),
                inv_number:result2.getText(search_id_lote),
                disponible:result2.getValue(search_disponible)
            }
            )
        }
        )
    }
    //Fin busqueda lotes
    
    
    //llenando las ubicaciones
if(result.getValue(search_lote)==true){
    ubicaciones.push({
        id:bin_id,
        ubicacion:bin_number,
        disponible:disponible,
        ubicacion_preferida: bin_fav,
        lotes:lote
    })
}else{
    ubicaciones.push({
        id:bin_id,
        ubicacion:bin_number,
        disponible:disponible,
        ubicacion_preferida: bin_fav,
    })
}
    if(disponible>0&&disponible!=null){
        total_disp=total_disp+disponible
    }
}
// FIN DE UBICACIONES

                        }
                        if(result.getValue(search_type)=="InvtPart"){
                            response.result.push({
                             id:result.getValue(search_id),
                             type:result.getValue(search_type),
                             islote:result.getValue(search_lote),
                             tota_disp:total_disp,
                             inventario:ubicaciones
                            })
                        }else{
                            response.result.push({
                                id:result.getValue(search_id),
                                type:result.getValue(search_type),
                                islote:result.getValue(search_lote),
                                tota_disp:total_disp})
                        }

                    
                    })    
                }
         } catch (error) {
             response.code=200
             response.message=error.message;
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
