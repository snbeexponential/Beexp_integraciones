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
    '../libs/lib_rest_export',
    '../libs/lib_rest_module',
    'N/runtime',
    "N/search",
    "N/format"
],
function(log, record, jsexport, jsimport, runtime,search,format) {

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
    //lo usamos en el get
    const directiondata={
        internalid:null,
        addressbook:[{
            addressbookaddress:null
        }]
    }


    entry_point.get = function(request) {         
        try {
            filters = [];
            var id = request.internalid;
            if (id) {
              filters.push(["internalidnumber", "equalto", id]);
            }
            else {
              response.message = "Missing fields add internalid in URL";
              return response;
            }
            var customerSearchObj = search.create({
                type: "customer",
                filters:[filters],
                columns:[
                   search_creditlimit=search.createColumn({name: "creditlimit", label: "Límite de crédito"}),
                   search_adeudototal=search.createColumn({name: "balance", label: " Adeudo total"}),
                   search_creditdisponible=search.createColumn({name: "formulacurrency",formula: "{creditlimit}-{balance}",label: "Crédito disponible"})
                ]
             });
             //var searchResultCount = customerSearchObj.runPaged().count;
             //log.debug("customerSearchObj result count",searchResultCount);
             var pagedData = customerSearchObj.runPaged({
                "pa​g​e​S​i​z​e": 1000,
              });

              var validatedata=true;

                for (var i = 0; i < pagedData.pageRanges.length; i++) {
                    var currentPage2 = pagedData.fetch(i);
                    currentPage2.data.forEach(function (result) {
                        validatedata=false
                        response.result.push({
                            creditlimit:result.getValue(search_creditlimit),
                            creditdisponible:result.getValue(search_creditdisponible),
                            adeudototal:result.getValue(search_adeudototal)
                        }
                        );
                        
                    });
              }              

              if(validatedata){
                response.code = 400;
                response.message = "No se encotraron resultados con el id proporcionado: "+id;
              }

        } catch (error) {
            response.code = 400;
            response.message = error.message;
        }

        log.debug('a vers que devuelve',response)
        return response;
    }

    entry_point.post = function(request) {
        return "post"
    }

    entry_point.put = (request) => {
            return "put"
    }


    return entry_point;
});