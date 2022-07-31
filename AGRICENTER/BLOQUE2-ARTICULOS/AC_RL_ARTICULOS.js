    /**
     * @author Saúl Navarro <>
     * @Modificacion <>
     * @Name AC_RL_ARTICULOS.js
     * @description Script para la la creación de Artículos
     * @external_ulr
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
        function (log, record, runtime, search, format) {

            const entry_point = {
                get: null,
                post: null,
                put: null
            };

            const response = {
                code: 200,
                message: "",
                result: []
            };


            const CONTRATO = {
            };
            //Consulta del articulos por numero de id interno
            entry_point.get = function (request) {
                   
                return "get";
            }

            //Creación del cliente
            entry_point.post = function (context) {

                try {
                    let request = JSON.parse(JSON.stringify(context));

                                    log.debug("DATITOS REQUEST",request)
                                    const record_item = record.create({ //Se crea la sales order
                                        type: record.Type.NON_INVENTORY_ITEM,
                                        isDynamic: true,
                                        })
                                        record_item.setValue({ fieldId: 'itemid', value:request.no_articulo_itelisis, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'displayname', value:request.nombre_art, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'class', value:request.clase, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'custitem_bex_az_subclase', value:request.subclase, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'custitem_beex_az_um', value:request.unidad_medida, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'custitem_bex_az_ingreact', value:request.ingredient_act, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'manufacturer', value:request.fabricante, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'salesdescription', value:request.description_ventas, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'taxschedule', value:request.taxschedule, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'taxschedule', value:request.impuesto_iva, ignoreFieldChange: true });
                                        record_item.setValue({ fieldId: 'custitem_bex_az_iepsarticulo', value:request.impuesto_ieps, ignoreFieldChange: true });
                                        var linea;
                                        var precios = request.precios;
                                            const sublistId = 'price1';
                                        log.debug("precios", precios)
                                            precios.forEach(function(precio) {
                                                log.debug("PRECIO", precio)
                                                log.debug("PRECIO Level", precio.level)
                                                linea = record_item.selectLine({ sublistId:"price1", line:precio.level});
                                                log.debug("LA LINEA", linea)
                                                    record_item.setCurrentSublistValue({ sublistId: "price1", fieldId: "currency", value:precio.currency });
                                                    record_item.setCurrentSublistValue({ sublistId: "price1", fieldId: "price_1_", value:precio.price});   
                                                    record_item.commitLine({ sublistId: "price1" });      
                                              });
        
                                            var id = record_item.save({ enableSourcing: true, ignoreMandatoryFields: true });                
                                          
                                        response.code=200
                                        response.message="Artículo agregado exitosamente"
                                        response.result.push({
                                            clientid:id                              
                                        })
                                        
                } catch (error) {
                    response.code=400
                    response.message=error.message;
                }
                return response
            }


            entry_point.put = (request) => {
              
                return "put";
            }
         
            return entry_point;
        });