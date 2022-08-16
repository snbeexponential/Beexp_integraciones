/**
 * @author Jorge Salas <jorge.salas@beexponential.com.mx>
 * @module restModule
 * @Name lib_rest_module.js
 * @Description module with multiple functions like validate mandatory, validate types, and a custom 'submitfields' with the twist of save sublist information and even subrecords.
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
 define(["N/search", "N/record", "N/format",], function (search, record, format) {
    /**
     * validates that variables are of the specified type, numerics are validated with isNAN, regexp is used for ISO8601 dates in format 2019-10-09, 2019-10-09T15:05:30 and 2019-10-09T15:05:30Z.
     * @function validateType
     * @param {string} type - values used are numeric, isoDate and any of typeof
     * @param {array} arr - array of variables to validate
     * @returns {boolean} - true if the variable match the specified type, false if not
     */
    function validateType(type, arr) {
        var status = true;
        if (type) {
            type = type.toLowerCase();
            var i = 0;

            while (status == true && i < arr.length) {
                //log.debug("1",arr);
                if (arr[i] || arr[i] === 0 || arr[i] === "0" || arr[i] === false) {
                    if (type == "isoDate" || type == "isodate" || type == "fecha") {
                        var pattern = new RegExp("^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$|^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?", "g");//TODO: mejorar aceptar "+"

                        if (!pattern.test(arr[i])) {
                            status = false;
                        }
                    }
                    else {
                        if (type == "texto") {
                            type = "string";
                        } else if (type == "numeric" || type == "numérico" || type == "numerico") {
                            type = "number";
                        }

                        if (typeof (arr[i]) != type) {
                            log.debug("validateTypeFalse:" + _typeof(arr[i]), arr[i]);
                            status = false;
                        }
                    }
                }

                i++;
            }
        }
        return status;
    }

    /**
     * comparison of data received and the declared type.
     * @function objValidateType
     * @param {object} objValues - obj requested to netsuite
     * @param {object} objTypes - obj of types, "sharedproperty: type", typically extracted form contracts.
     * @returns {boolean} if any data does not math returns false, if all dat match returns true.
     */
    function objValidateType(objValues, objTypes) {
        var status = true;
        var status2;

        for (var elm in objValues) {
            if (objValues.hasOwnProperty(elm)) {
                //log.debug("elm", elm);

                if (typeof (objValues[elm]) == "object") {
                    status2 = objValidateType(objValues[elm], objTypes);
                } else if (typeof objValues[elm] != "undefined") {
                    log.debug(objTypes[elm], objValues[elm]);
                    status2 = validateType(objTypes[elm], [objValues[elm]]);
                }
                if (!status2) {
                    status = false;
                    log.error("error: " + elm, "typeof: " + typeof objValues[elm] + ", debe ser " + objTypes[elm]);
                }
            }
        }

        return status;
    }
    /**
     * transform an object to record, should be used only if submitfields original function not suit your needs, do not use it if you need to get some values of the record being cerated/transformed/updated.
     * @function submitFieldsJS
     * @param request - first level of obj are id (load/transform), recordType (mandatory), from (only in transform), isDynamic (default false), ignoreMandatoryFields (default false) and values. values is an object with property:value, netsuidFieldId: valueToSave, also, can contain netsuiteSublistId:[{}], each element of the array are newlines, the line to save can be declarated trought property lineid:value or lineSearch:{fieldId:fieldToFind, value:valueToFind}. In each element of the array are objects netsuiteSublistFieldId:valueToSave or netsuiteSublistFieldId:[{}], this will be subrecords whit the same array structure as described before.
     * @returns {{msg: string, recordId: void | number, code: number}}
     */
    function submitFieldsJS(request) {
        function validateType(x) {
            var status = false;

            var type = typeof (x);

            if (type != 'function' && type != 'symbol' && type != "undefined") {
                status = true;
            }

            return status;
        }

        function parseValues(objField, value) {
            if (!value) return "";
            var value2 = "";
            if (objField.type == "date" || objField.type == "datetime" || objField.type == "datetimetz") {
                //var regex = RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}');//TODO mejorar deteccion de iso
                if (typeof (value) == "string" && value.indexOf("-") == 4) {
                    if (value.length > 19) {
                        value = value.substring(0, 19)
                    }
                    log.debug("if", value)

                    /*
                    var date = new Date(value);
                    var offset = date.getTimezoneOffset() * 60000+ 5*60000;
                    var time = timeError + offset;
                    time += date.getTime();
                    value = new Date(time);//*/
                    //value = jsDate.parse(value);
                    value = String(value).split('T')[0].split('-').join('/');
                    //var arr_date = String(value).split('T');
                    //value = arr_date[0].split('-').join('/') + 'T' + arr_date[1];
                    log.debug('new format date', value);
                    value = new Date(value);
                    value = format.format({
                        value: value,
                        type: objField.type,
                        timezone: format.Timezone.AMERICA_LOS_ANGELES
                    });
                    value = format.parse({
                        value: value,
                        type: objField.type,
                        timezone: format.Timezone.AMERICA_MEXICO_CITY
                    });
                    log.debug('AL|date value', { type: typeof value, value: value });
                } else {
                    log.debug("else", typeof (value) + ", " + value)
                    if (value) {
                        value2 = format.parse({
                            value: value,
                            type: objField.type
                        });
                        if (value2 == value) {
                            value = new Date(value);
                        } else {
                            value = value2;
                        }
                    }
                    log.debug("format", value)
                }
                log.debug('parse1', value);
            } else if (objField.type == "currency") {
                var requestPropertyString = value.toString();

                if (requestPropertyString.length > 20) {
                    var requestPropertyString20 = requestPropertyString.substring(19, 20);
                    var requestPropertyString21 = requestPropertyString.substring(20, 21);
                    requestPropertyString = requestPropertyString.substring(0, 19);

                    if (requestPropertyString21 > 4) {
                        requestPropertyString20++;
                    }

                    value = requestPropertyString + requestPropertyString20;
                }
            }
            return value;
        }
        log.audit('JSrequest1', request);
        var timeError = 0;
        var objRecord;
        var code = 200;
        var msg = "";
        var recordId = -1;
        var ignoreMandatoryFields = false;

        if (request.ignoreMandatoryFields == true) {
            ignoreMandatoryFields = true;
        }

        if (request.isDynamic != true && request.isDynamic != false) {
            request.isDynamic = false;
        }

        log.debug("aa");

        if (request.from) {
            log.debug("a1");
            objRecord = record.transform({
                fromType: request.from,
                fromId: request.id,
                toType: request.recordType,
                isDynamic: request.isDynamic,
                defaultValues: request.defaultValues
            });
            log.debug('transform');
        } else if (!request.id) {
            log.debug("a2");
            objRecord = record.create({
                type: request.recordType,
                isDynamic: request.isDynamic,
                defaultValues: request.defaultValues
            });
            log.debug("a22");
        } else {
            log.debug("a3");
            objRecord = record.load({
                type: request.recordType,
                id: request.id,
                isDynamic: request.isDynamic,
                defaultValues: request.defaultValues
            });
        }

        log.debug("a");
        request = request.values;
        log.debug("b");
        objCrawler(objRecord, request);

        function objCrawler(objRecord, request, isSubrecord) {
            if (!isSubrecord) {
                isSubrecord = false;
            }
            var sublistName = objRecord.getSublists();
            var objFields = objRecord.getFields();
            var macroList = {};
            try {
                macroList = objRecord.getMacros();
            }
            catch (e) { }
            log.debug('propert value', property);
            log.debug('request value', request);
            for (var property in request) {
                if (request.hasOwnProperty(property)) {
                    if (Array.isArray(request[property]) && sublistName.indexOf(property) != -1) {
                        log.debug("property is array", property);
                        log.debug("nombre sublista",sublistName);
                        log.debug('property is sublist', property);
                        var sublistId = property;
                        var sublistFields = objRecord.getSublistFields({
                            sublistId: sublistId
                        });
                        log.debug('sublist fields', sublistFields);
                        sublistFields.push("inventorydetail"); //TODO: inventory detail no aparece como un campo en la sublista, no la mejor solucion
                        sublistFields.push("itempricing");
                        sublistFields.push("addressbookaddress");
                        sublistFields.push("contactroles");
                        sublistFields.push("submachine");
                        sublistFields.push("subsidiary");
                        sublistFields.push("salesteam");
                        sublistFields.push("taxregistration");
                        
                        //sublistFields.push("contact");

                        for (var i in request[sublistId]) {
                            var emptyObj = !Object.keys(request[sublistId][i])[0];
                            log.debug("emptyObj", emptyObj);
                            if (!emptyObj) {
                                var lineId = void 0;
                                var lineCount = 0;
                                if (request[sublistId][i]["lineSearch"] && request[sublistId][i]["lineSearch"]["value"]) {
                                    var line = objRecord.findSublistLineWithValue({
                                        sublistId: sublistId,
                                        fieldId: request[sublistId][i]["lineSearch"]["fieldId"],
                                        value: request[sublistId][i]["lineSearch"]["value"]
                                    });
                                    log.debug("requestlinesearch", line);
                                    request[sublistId][i]["lineId"] = line;
                                }
                                log.debug("isDynamic", objRecord.isDynamic);
                                if (objRecord.isDynamic) {
                                    if (request[sublistId][i]["lineId"] || request[sublistId][i]["lineId"] == 0) {
                                        log.debug("lineSelected", request[sublistId][i].lineId);
                                        objRecord.selectLine({
                                            sublistId: sublistId,
                                            line: request[sublistId][i].lineId
                                        });
                                    } else {
                                        log.debug("newLine", sublistId);
                                        objRecord.selectNewLine({
                                            sublistId: sublistId
                                        });
                                        lineId = objRecord.getCurrentSublistIndex({
                                            sublistId: sublistId
                                        });
                                        log.debug("line", lineId);
                                    }
                                } else {
                                    if (request[sublistId][i]["lineId"] || request[sublistId][i]["lineId"] == 0) {
                                        log.debug("lineSelected", request[sublistId][i].lineId);
                                        lineId = request[sublistId][i].lineId;
                                    } else {
                                        log.debug("natural line count", lineId);
                                        lineId = lineCount;
                                    }
                                }
                                for (var fieldId in request[sublistId][i]) {
                                    if (request[sublistId][i].hasOwnProperty(fieldId)) {
                                        if (sublistFields.indexOf(fieldId) != -1) {
                                            var sublistField = void 0;
                                            if (objRecord.isDynamic && !isSubrecord) {
                                                sublistField = objRecord.getCurrentSublistField({
                                                    sublistId: sublistId,
                                                    fieldId: fieldId
                                                });
                                            } else {
                                                sublistField = objRecord.getSublistField({
                                                    sublistId: sublistId,
                                                    fieldId: fieldId,
                                                    line: lineId ? lineId : (lineId == 0 ? 0 : request[sublistId][i]["lineId"])
                                                });
                                                log.debug('sublistField', sublistField);
                                            }

                                            if (sublistField.type == "summary") {
                                                log.debug('isSubrecord', fieldId);
                                                var objSubrecord = void 0;

                                                if (objRecord.isDynamic) {
                                                    objSubrecord = objRecord.getCurrentSublistSubrecord({
                                                        sublistId: sublistId,
                                                        fieldId: fieldId
                                                    });
                                                } else {
                                                    objSubrecord = objRecord.getSublistSubrecord({
                                                        sublistId: sublistId,
                                                        fieldId: fieldId,
                                                        line: lineId || request[sublistId][i]["lineId"]
                                                    });
                                                }

                                                objCrawler(objSubrecord, request[sublistId][i][fieldId], true);
                                            } else {
                                                log.debug(request[sublistId][i][fieldId])
                                                if (validateType(request[sublistId][i][fieldId])) {

                                                    request[sublistId][i][fieldId] = parseValues(sublistField, request[sublistId][i][fieldId]);

                                                    log.debug('fieldIdsave:' + fieldId, request[sublistId][i][fieldId]);
                                                    log.debug("typeof", typeof (request[sublistId][i][fieldId]))
                                                    if (objRecord.isDynamic) {
                                                        objRecord.setCurrentSublistValue({
                                                            sublistId: sublistId,
                                                            fieldId: fieldId,
                                                            value: request[sublistId][i][fieldId]
                                                        });
                                                    } else {
                                                        objRecord.setSublistValue({
                                                            sublistId: sublistId,
                                                            fieldId: fieldId,
                                                            line: lineId,
                                                            value: request[sublistId][i][fieldId]
                                                        });
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                log.debug("endfor line");
                                log.debug("commitline", objRecord.getValue("type"))
                                if (objRecord.isDynamic) {
                                    log.debug("commitline", objRecord.isDynamic)
                                    objRecord.commitLine({
                                        sublistId: sublistId
                                    });
                                }
                            }
                        }
                        log.debug("end for sublist")
                        lineCount++;
                    }
                    else if (objFields.indexOf(property) != -1) {
                        log.debug("indexoffields:" + property, "true");
                        var objField = objRecord.getField({
                            fieldId: property
                        });
                        if (objField) {
                            if (objField.type == "summary") {
                                var _objSubrecord = objRecord.getSubrecord({
                                    fieldId: property
                                });

                                objCrawler(_objSubrecord, request[property], true);
                            } else {

                                if (validateType(request[property])) {
                                    request[property] = parseValues(objField, request[property]);
                                    log.debug("fieldIdSave:" + property, request[property]);
                                    objRecord.setValue({
                                        fieldId: property,
                                        value: request[property]
                                    });
                                }
                            }
                        }
                    }
                    else if (macroList.hasOwnProperty(property)) {
                        log.debug("macroList", macroList);
                        log.debug("macros:" + property, request[property])
                        var asd = objRecord.executeMacro(request[property]);
                        log.debug("asd", asd);

                    }
                }
            }
        } //try {

        log.debug('save', "save");
        recordId = objRecord.save({
            ignoreMandatoryFields: ignoreMandatoryFields
        }); //}catch(e){}

        if (recordId < 1) {
            code = -2;
            msg = "error al guardar el registro";
        }
        log.error({
            title: '1231',
            details: {
                "code": code,
                "msg": msg,
                "recordId": recordId
            }
        })
        return {
            "code": code,
            "msg": msg,
            "recordId": recordId
        };
    }
    function rollback(operationNumber, locationId, journalArr, i) {
        log.audit("tollback", operationNumber);
        var invoiceInternalId = "";
        var salesOrderId = "";
        try {
            var invoiceSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["voided", "is", "F"],
                        "AND",
                        ["createdfrom.location", "anyof", locationId],
                        "AND",
                        ["createdfrom.custbody_bex_operation_number", "is", operationNumber],
                        "AND",
                        ["createdfrom.type", "anyof", "CustInvc"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "recordtype",
                            summary: "GROUP"
                        }),
                        search.createColumn({
                            name: "internalid",
                            summary: "GROUP"
                        })
                    ]
            });
            var searchResultCount = invoiceSearchObj.runPaged().count;
            log.debug("invoiceSearchObj result count", searchResultCount);
            invoiceSearchObj.run().each(function (result) {
                var id = result.getValue({
                    name: "internalid",
                    summary: "GROUP"
                });
                var recordType = result.getValue({
                    name: "recordtype",
                    summary: "GROUP"
                });
                log.audit("invoiceRelatedAllValues", result.getAllValues());
                transaction.void({
                    type: recordType,
                    id: id
                });
                return true;
            });
            var salesorderSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["voided", "is", "F"],
                        "AND",
                        ["createdfrom.location", "anyof", locationId],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["createdfrom.custbody_bex_operation_number", "is", operationNumber],
                        "AND",
                        ["createdfrom.type", "anyof", "SalesOrd"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            summary: "GROUP"
                        }),
                        search.createColumn({
                            name: "recordtype",
                            summary: "GROUP"
                        })
                    ]
            });
            searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("salesorderSearchObj result count", searchResultCount);
            salesorderSearchObj.run().each(function (result) {
                log.audit("salesRelatedAllValues", result.getAllValues());
                var id = result.getValue({
                    name: "internalid",
                    summary: "GROUP"
                });
                var recordType = result.getValue({
                    name: "recordtype",
                    summary: "GROUP"
                });
                if (recordType == record.Type.ITEM_FULFILLMENT) {
                    record.delete({
                        type: record.Type.ITEM_FULFILLMENT,
                        id: id,
                    });
                } else {
                    transaction.void({
                        type: recordType,
                        id: id
                    });
                }
                return true;
            });

            salesorderSearchObj = search.create({
                type: "salesorder",
                filters:
                    [
                        ["type", "anyof", "SalesOrd"],
                        "AND",
                        ["custbody_bex_operation_number", "is", operationNumber],
                        "AND",
                        ["voided", "is", "F"],
                        "AND",
                        ["location", "anyof", locationId],
                        "AND",
                        ["mainline", "is", "T"],
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            summary: "GROUP"
                        })
                    ]
            });
            searchResultCount = salesorderSearchObj.runPaged().count;
            log.debug("salesorderSearchObj2 result count", searchResultCount);
            salesorderSearchObj.run().each(function (result) {
                log.audit("salesAllValues", result.getAllValues());
                salesOrderId = result.getValue({
                    name: "internalid",
                    summary: "GROUP"
                });
                transaction.void({
                    type: "salesorder",
                    id: salesOrderId
                });
                return true;
            });
            if (journalArr && journalArr[0]) {
                for (var element in journalArr) {
                    if (journalArr.hasOwnProperty(element)) {
                        transaction.void({
                            type: "journalentry",
                            id: journalArr[element]
                        });
                    }
                }
            }
        }
        catch (e) {
            if (!i) {
                i = 0;
            }
            i++;
            log.error("rollbalck.e", e);
            log.debug("rollbalck.e", i);
            if (i < 10) {
                rollback(operationNumber, locationId, journalArr, i);
            }
        }
    }

    /**
    * Para guardar datos que faciliten futuros rastreos
    * @param {String} record_type Type del Record
    * @param {Number} record_id ID del record correspondiente
    * @param {Object} values Objeto con los datos de rastreo, en el formato { custbody_id : valor }
    */
    function save_track_data(record_type, record_id, values) {
        var id = record.submitFields({
            type: record_type,
            id: record_id,
            values: values
        });
    }

    return {
        objValidateType: objValidateType,
        //validateObligatory: validateObligatory,
        submitFieldsJS: submitFieldsJS,
        rollback: rollback,
        save_track_data: save_track_data
    };
});