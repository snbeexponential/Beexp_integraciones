/**
 * @author Evelyn Sarmiento Cámbara <evelyn.sarmiento@beexponential.com.mx>
 * @date 10/03/2022
 * @name dt_rl_articulos
 * @description Script para la consulta de novacaja a Netsuite
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/format', 'N/log', 'N/record', 'N/runtime', 'N/search'],
    /**
 * @param{format} format
 * @param{log} log
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (format, log, record, runtime, search) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        
        let response = {
            code: 200,
            message: "",
            result: []
        };
        
        const get = (request) => {
            log.debug('test','test');
            log.debug('request',request);
            try {
                log.debug('line 35','line 35');
                let filters = [];
                let fecha_desde;
                let fecha_hasta;
                let id = request.internalid;
                log.debug('request id',id);
                if (request.initdate && request.enddate) {
                    
                    log.debug('line 41','line 41');
                    fecha_desde = new Date(request.initdate);
                    fecha_hasta = new Date(request.enddate);
                    var formattedDateString_initdate = format.format({
                        value: fecha_desde,
                        type: format.Type.DATETIME
                    });
                    log.debug("desde", "-------------------------");
                    log.debug("desde", fecha_desde);
                    log.debug("hasta", fecha_hasta);
                    log.debug("desde", "-----------FEMCHAS--------------");

                    var formattedDateString_enddate = format.format({
                        value: fecha_hasta,
                        type: format.Type.DATETIME,
                    });

                    log.debug("desde", "-------------------------");
                    log.debug("desde", formattedDateString_initdate);
                    log.debug("hasta", formattedDateString_enddate);
                    log.debug("desde", "-----------DESPUES DE PROCESAR--------------");

                    formattedDateString_initdate = formattedDateString_initdate.replace(
                        /(:\d{2}):\d{1,2}\b/,
                        "$1"
                    );
                    formattedDateString_enddate = formattedDateString_enddate.replace(
                        /(:\d{2}):\d{1,2}\b/,
                        "$1"
                    );
                }
                if (id) {
                    log.debug('id',id);
                    filters.push(["internalidnumber", "equalto", id]);
                } else if (formattedDateString_initdate && formattedDateString_enddate) {
                    filters.push([
                        "modified",
                        "within",
                        formattedDateString_initdate,
                        formattedDateString_enddate,
                    ]);

                } else {
                    log.debug('nothing','en el else');
                    response.message = "Campos opcionales: id || desde, hasta";
                    return response;
                }

                var itemSearchObj = search.create({
                    type: "item",
                    filters: filters,
                    columns:
                        [
                            search.createColumn({
                                name: "itemid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            }),
                            search_displayname = search.createColumn({ name: "displayname", label: "Display Name" }),
                            search_description = search.createColumn({ name: "salesdescription", label: "Description" }),
                            search_type = search.createColumn({ name: "type", label: "Type" }),
                            search_price = search.createColumn({ name: "baseprice", label: "Base Price" }),
                            search_vendor = search.createColumn({ name: "vendorname", label: "Vendor" }),
                            search_itemid = search.createColumn({ name: "internalid", label: "itemid" }),
                            search_sat =  search.createColumn({name: "custitem_mx_txn_item_sat_item_code", label: "SAT Item Code"}),
                            search_sku = search.createColumn({ name: "upccode", label: "upccode" }),
                            search_afectainv = search.createColumn({ name: "custitem_afectainv", label: "Afecta Inventario" }),
                            search_desc = search.createColumn({ name: "custitem_admitedesc", label: "Admite Ofertas" }),
                            search_decim = search.createColumn({ name: "custitem_decimalesenunidad", label: "Decimales Unidad" }),
                            search_ofertas = search.createColumn({ name: "custitem_admite_ofertas", label: "Admite Ofertas" }),
                            search_notas = search.createColumn({ name: "custitem_notas_mercancia", label: "Notas" }),
                            search_cantidad = search.createColumn({ name: "totalquantityonhand", label: "On Hand" }),
                            search_ubicacion = search.createColumn({name: "location", label: "Location"}),
                         	search_desccomp = search.createColumn({name: "custitem_desccomp", label: "Desccomp"}),
                            search_ginv = search.createColumn({name: "custitem_artginv", label: "GetInv"}),

                        ]
                });
                // var resultado = [];
                var searchResultCount = itemSearchObj.runPaged().pageRanges;
                var pagedData = itemSearchObj.runPaged({ "pa​g​e​S​i​z​e": 1000 });
                for (var i = 0; i < pagedData.pageRanges.length; i++) {
                    var currentPage = pagedData.fetch(i);
                currentPage.data.forEach(function (result) {

                    var inventorynumberSearchObj = search.create({
                        type: "inventorynumber",
                        filters: [[["item", "anyof", result.getValue(search_itemid)]]],
                        columns:
                            [
                                search.createColumn({
                                    name: "inventorynumber",
                                    sort: search.Sort.ASC,
                                    label: "Number"
                                }),
                                search_serial = search.createColumn({ name: "internalid", label: "Internal ID" }),
                                search_serialname = search.createColumn({ name: "inventorynumber", label: "Serial Lot" }),
                                search_location = search.createColumn({name: "location", label: "Location"}),
                                
                                // search.createColumn({name: "location", label: "Location"})
                            ]
                    });

                    
                    var serial_number = [];
                        var searchResultCount = inventorynumberSearchObj.runPaged().pageRanges;
                        var pagedData2 = inventorynumberSearchObj.runPaged({
                            "pa​g​e​S​i​z​e": 1000,
                        });
                        for (var j = 0; j < pagedData2.pageRanges.length; j++) {
                            var currentPage2 = pagedData2.fetch(j);
                            currentPage2.data.forEach(function (result2) {
                                //resultado.push(result);
                                serial_number.push({
                                    //serial: result2.getValue(search_serial),
                                    serial: result2.getValue(search_serialname),
                                });
                            });
                        }
          
                    //resultado.push(result);
                    response.result.push({
                      internalid: result.getValue(search_itemid),
                      art_descripcion: result.getValue(search_displayname),
                      ubicacion: result.getValue(search_ubicacion),
                     // type: result.getValue(search_type),
                      art_desccomp: result.getValue(search_description),
                      costoarticulo: result.getValue(search_price),
                      proveedor: result.getValue(search_vendor),
                      art_desccomp: result.getValue(search_desccomp),
                      art_gtinv: result.getValue(search_ginv),
                      SAT_ProdServClave: result.getValue(search_sat),
                      art_sku: result.getValue(search_sku),
                      art_afectainv: result.getValue(search_afectainv),
                      art_admitedesc: result.getValue(search_desc),
                      art_decimalesunidades: result.getValue(search_decim),
                      art_notas: result.getValue(search_notas),
                      art_admiteofertas: result.getValue(search_ofertas),
                      
                      //islote:result.getValue(search_lote),
                      //upccode: result.getValue(search_upccode),
                      //salesdescription: result.getValue(search_salesdescription),
                      //custitem_mx_txn_item_sat_item_code: result.getValue(search_taxcode),
                      //lastpurchaseprice: result.getValue(search_lastpurchaseprice),
                      //saleunit: result.getValue(search_saleunit),
                      //isonline: result.getValue(search_isonline),
                      //custitemid_artnvo_fa01: result.getValue(search_custitemid_artnvo_fa01),
                      //custitemid_artremt_fa02: result.getValue(search_custitemid_artremt_fa02),
                      //custitem2: result.getValue(search_custitem2),
                      //cost: result.getValue(search_cost),
                      //custitem_ste_taxschedule: result.getValue(search_custitem_ste_taxschedule),
                      //price: lista_item_price
                      art_espkt: [
                          {
                              idarticulo: result.getValue(search_itemid),
                              cantidad: result.getValue(search_cantidad),
                              serial_number: serial_number,
                          }
                      ]
                    });
                  });
                }
            
                // response.result.push({
                //     displayname: result.getValue(search_displayname),
                //     salesdescription: result.getValue(search_description),
                //     type: result.getValue(search_type),
                //     price: result.getValue(search_price),
                //     vendor: result.getValue(search_vendor),
                // })
                log.debug('antes del response','response d');
                log.debug('RESPONSE',response);
                return response;
            } catch (error) {
                log.debug('error: ',error);
                reponse.message = error.message;
            }
            log.debug('antes del response','response d');
            log.debug('RESPONSE',response);
            return response;   
            //return 'gola';
        }



        return { get: get }

    });
