/**
 * @author Miguel Peña <miguel.pena@beexponential.com>
 * @modifico Carlos Flores <carlos.flores@beexponential.com>
 * @fecha 04/10/2021
 * @Name GES_rl_test_lib_export.js
 * @description Script de prueba para el desarrollo de la libreria de exportacion de records
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

 define(['N/log', '../libs/lib_rest_export', 'N/search', ' N/format'], function(log, jsexport, search, format) {
    const entry_point = {
        get: null
    };

    var response = {
        code: 200,
        message: "",
        result: []
    };

    function groupByKey(array, key) {
        return array.reduce((hash, obj) => {
            if(obj[key] === undefined) return hash; 
            return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
        }, {})
    }


    entry_point.get = function(request) {
        try {
            
            filters = []
            var pagina = request.pagina || 1;
            var id = request.internalid;
            var fecha_desde;
            var fecha_hasta;
            if (request.desde && request.hasta) {
                fecha_desde = new Date(request.desde);
                fecha_hasta = new Date(request.hasta);
                var formattedDateString_desde = format.format({ value: fecha_desde, type: format.Type.DATETIME });
                var formattedDateString_hasta = format.format({ value: fecha_hasta, type: format.Type.DATETIME });
                formattedDateString_desde = formattedDateString_desde.replace(/(:\d{2}):\d{1,2}\b/, '$1');
                formattedDateString_hasta = formattedDateString_hasta.replace(/(:\d{2}):\d{1,2}\b/, '$1');
            }
            if (id) {
                filters.push(["internalidnumber", "equalto", id]);
            } else if (formattedDateString_desde && formattedDateString_hasta) {
                filters.push(["custitem_fig_fecha_modificacion", "within", formattedDateString_desde, formattedDateString_hasta]);
            } else {
                response.message = 'Missing fields: internalid || desde, hasta';
                return response;
            }
            
            var itemSearchObj = search.create({
                type: "item",
                filters: filters, // [["internalid","anyof",id] // "31884"  "59341"],
                columns:
                [
                    search.createColumn({name: "internalId", sort: search.Sort.ASC}),
                    search.createColumn({name: "pricelevel", join: "pricing", sort: search.Sort.DESC, label: "Price Level"}),
                    search.createColumn({name: "minimumquantity",join: "pricing",sort: search.Sort.ASC,  label: "Minimum Quantity"}),                    
                    search.createColumn({name: "unitprice",join: "pricing",label: "Unit Price"}),
                    search.createColumn({name: "quantityrange",join: "pricing", label: "Quantity Range"})                 
                    // search.createColumn({name: "saleunit",join: "pricing",label: "Sale Unit"}),                       
                    // search.createColumn({name: "maximumquantity",join: "pricing",label: "Maximum Quantity"})
                ]
            });
            var resultado = [];
            var searchResultCount = itemSearchObj.runPaged().pageRanges;            
            var pagedData = itemSearchObj.runPaged({ "pa​g​e​S​i​z​e": 1000 });
            for( var i=0; i < pagedData.pageRanges.length; i++ ) {
                var currentPage = pagedData.fetch(i);
                currentPage.data.forEach( function(result) {
                    //resultado.push(result);
                    resultado.push({
                        id: result.id,
                        pricelevel: result.getText({name: "pricelevel", join: "pricing"}),
                        unitprice: result.getValue({name: "unitprice", join: "pricing"}),
                        quantityrange: result.getValue({name: "quantityrange", join: "pricing"})                                               
                    });
                });
            }   
            
            return groupByKey(resultado, "id");
                 
            
        } catch (error) {
            log.debug('error personalizado', error)
            response.message = error.message;
        }
        return response;
    }
    return entry_point;
});