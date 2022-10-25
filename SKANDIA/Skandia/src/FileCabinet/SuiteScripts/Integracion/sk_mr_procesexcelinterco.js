/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NAmdConfig ../excel_module/sk_sc_excel_conf.json
 */
define(["N/email", "N/file", "N/record", "N/search", "xlsx", "N/runtime"], /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 */ (email, file, record, search, XLSX, runtime) => {
  /**
   * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
   * @param {Object} inputContext
   * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Object} inputContext.ObjectRef - Object that references the input data
   * @typedef {Object} ObjectRef
   * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
   * @property {string} ObjectRef.type - Type of the record instance that contains the input data
   * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
   * @since 2015.2
   */
  //Top variables modificado por saul navarro el 12/09/22
  //Variables utiles globales
  let purchaseObj;
  let purchaseid;

  //Campos para Cargar en cabecera
  let po_externalid;
  let po_vendor;
  let po_subsidiary;
  let po_employee;
  let po_supervisorapproval;
  let po_duedate;
  let po_trandate;
  let po_memo;
  let po_department;
  let po_clase;
  let po_location;
  let po_currency;
  let po_exchangeRate;
  //Variables id recuperado de Búsqueda de los campos de cabecera
  let vendor_id;
  let subsidiary_id;
  let employee_id;
  let department_id;
  let clase_id;
  let location_id;
  let currency_id;

  //Variables id para Búsqueda de los campos de Línea
  let line_item_id;
  let line_location;
  let line_department_id;
  let itemLine_class;
  let itemLine_contrato_id; //PENDIENTE DE INTEGRAR

  const getInputData = (inputContext) => {
    const contentfromget = JSON.parse(
      runtime
        .getCurrentScript()
        .getParameter({ name: "custscript_parametrointerco" })
    );
    documentId = contentfromget.idxls;
    folderId = contentfromget.folderselec;
    log.debug("Se traen los datos ", documentId);
    var obejson = excelFileToJson(documentId);

    var numinv = 0;
    obejson[0].forEach((element) => {
      if (element.externalid) {
        numinv++;
      }
    });
    var arreglimto = [];

    for (let i = 0; i < numinv; i++) {
      arreglimto.push({
        cabecera: {},
        lines: [],
      });
    }
    var flag1 = 0;
    obejson[0].forEach((element) => {
      if (element.externalid && flag1 < numinv) {
        arreglimto[flag1].cabecera = {
          externalid: element.externalid || null,
          otherrefnum: element.otherrefnum || null,
          vendor: element.vendor || null,
          subsidiary: element.subsidiary || null,
          employee: element.employee || null,
          supervisorapproval: element.supervisorapproval || null,
          duedate: element.duedate ? element.duedate : "",
          trandate: element.trandate ? element.tranDate : "",
          memo: element.memo || null,
          department: element.department || null,
          clase: element.class || null,
          location: element.location || null,
          currency: element.currency || null,
          exchangeRate: element.exchangeRate || null,
        };
        arreglimto[flag1].lines.push({
          purchaseItemLine_item: element.purchaseItemLine_item || null,
          purchaseItemLine_quantity: element.purchaseItemLine_quantity || null,
          purchaseItemLine_units: element.purchaseItemLine_units || null,
          purchaseItemLine_rate: element.purchaseItemLine_rate || null,
          purchaseItemLine_amount: element.purchaseItemLine_amount || null,
          custrecord_mx_sat_to_code: element.custrecord_mx_sat_to_code || null,
          purchaseItemLine_description: element.purchaseItemLine_description ||null,
          purchaseItemLine_department: element.purchaseItemLine_department || null,
          purchaseItemLine_class: element.purchaseItemLine_class || null,
          purchaseItemLine_location: element.purchaseItemLine_location || null,
        });
        flag1++;
      } else {
        var newindex = flag1 - 1;
        arreglimto[newindex].lines.push({
          purchaseItemLine_item: element.purchaseItemLine_item || null,
          purchaseItemLine_quantity: element.purchaseItemLine_quantity || null,
          purchaseItemLine_units: element.purchaseItemLine_units || null,
          purchaseItemLine_rate: element.purchaseItemLine_rate || null,
          purchaseItemLine_amount: element.purchaseItemLine_amount || null,
          custrecord_mx_sat_to_code: element.custrecord_mx_sat_to_code || null,
          purchaseItemLine_description: element.purchaseItemLine_description || null,
          purchaseItemLine_department: element.purchaseItemLine_department || null,
          purchaseItemLine_class: element.purchaseItemLine_class || null,
          purchaseItemLine_location: element.purchaseItemLine_location || null,
        });
      }
    });
    log.debug("Campos encontradoe en el documento", arreglimto);
    return arreglimto;
  };

  const map = (mapContext) => {
    try {
      var datos = JSON.parse(mapContext.value);
      //Campos de Cabecera
      //po_otherrefnum = datos.cabecera.otherrefnum
      po_externalid = datos.cabecera.externalid;  //Search * +
      po_vendor = datos.cabecera.vendor;          //Search * +
      po_subsidiary = datos.cabecera.subsidiary;  //Search * +
      po_employee = datos.cabecera.employee;      //Search * +
      po_department = datos.cabecera.department;  //Search * +
      po_clase = datos.cabecera.clase;            //Search * +
      po_location = datos.cabecera.location;      //Search * +
      po_currency = datos.cabecera.currency;      //Search * +
      //po_supervisorapproval = datos.cabecera.supervisorapproval;
      po_duedate = transformdate(datos.cabecera.duedate);   // +
      po_trandate = transformdate(datos.cabecera.trandate); // +
      po_memo = datos.cabecera.memo;                        // +
      po_exchangeRate = datos.cabecera.exchangeRate;        // +



      //#region Busqueda 1 vendor
      try {
          var vendorSearchObj = search.create({
            type: "vendor",
            filters: [["entityid", "is", po_vendor]],
            columns: [
              (search_vendor = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = vendorSearchObj.runPaged().count;
          log.debug("vendorSearchObj result count", searchResultCount);
          vendorSearchObj.run().each(function (result) {
            vendor_id = result.getValue(search_vendor);
            return true;
          });
      
      } catch (error) {
        vendor_id = "";
        log.debug("Error recuperando id de PROVEEDOR", error.message);
      }
      //#endregion
      //#region Busqueda 2 Subsidiaria

      try {
        var subsidiarySearchObj = search.create({
          type: "subsidiary",
          filters: [["namenohierarchy", "is", po_subsidiary]],
          columns: [
            (search_subsidiary = search.createColumn({
              name: "internalid",
              label: "Internal ID",
            })),
          ],
        });
        var searchResultCount = subsidiarySearchObj.runPaged().count;
        subsidiarySearchObj.run().each(function (result) {
          subsidiary_id = result.getValue(search_subsidiary);
          return true;
        });
      } catch (error) {
        subsidiary_id = "";
        log.debug("Error en la busqueda subsidiaria", error.message);
      }

      //#endregion
      //#region Busqueda 3 employee
      try {
        var employeeSearchObj = search.create({
          type: "employee",
          filters:
          [
             ["entityid","haskeywords",po_employee]
          ],
          columns:
          [
            search_employee = search.createColumn({name: "internalid", label: "Internal ID"})
          ]
       });
       var searchResultCount = employeeSearchObj.runPaged().count;
       log.debug("employeeSearchObj result count",searchResultCount);
       employeeSearchObj.run().each(function(result){
        employee_id = result.getValue(search_employee)
          return true;
       });
       
      } catch (error) {
        employee_id = ""
        log.debug("Error en la busqueda employee", error.message); 
      }
      //#endregion
      //#region Busqueda 4 department
      try {
        if (po_department) {
          var departmentSearchObj = search.create({
            type: "department",
            filters: [["namenohierarchy", "is", po_department]],
            columns: [
              (search_depart = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = departmentSearchObj.runPaged().count;
          log.debug("departmentSearchObj result count", searchResultCount);
          departmentSearchObj.run().each(function (result) {
            department_id = result.getValue(search_depart);
            return true;
          });
        } else {
          department_id = "";
        }
      } catch (error) {
        department_id = "";
        log.debug("fallo en busqueda del departamento", error.message);
      }
      //#endregion
      //#region Busqueda 5 clase
      try {
        if (po_clase) {
          var classificationSearchObj = search.create({
            type: "classification",
            filters: [["name", "is", po_clase]],
            columns: [
              search.createColumn({
                name: "name",
                sort: search.Sort.ASC,
                label: "Name",
              }),
              (search_class = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = classificationSearchObj.runPaged().count;
          log.debug("classificationSearchObj result count", searchResultCount);
          classificationSearchObj.run().each(function (result) {
            clase_id = result.getValue(search_class);

            return true;
          });
        } else {
          clase_id = "";
        }
      } catch (error) {
        clase_id = "";
        log.debug("fallo en busqueda de la clase", error.message);
      }
      //#endregion
      //#region Busqueda 6 location
      try {
        if (po_location) {
          var locationSearchObj = search.create({
            type: "location",
            filters: [["name", "is", po_location]],
            columns: [
              (search_location = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = locationSearchObj.runPaged().count;
          log.debug("locationSearchObj result count", searchResultCount);
          locationSearchObj.run().each(function (result) {
            location_id = result.getValue(search_location);
            log.debug("location id", location_id);
            return true;
          });
        } else {
          location_id = "";
        }
      } catch (error) {
        location_id = "";
        log.debug("fallo en busqueda de location", error.message);
      }
      //#endregion
      //#region Busqueda 7 Currency
      try {
        var currencySearchObj = search.create({
          type: "currency",
          filters: [["name", "is", po_currency]],
          columns: [
            (search_currency = search.createColumn({
              name: "internalid",
              label: "Internal ID",
            })),
          ],
        });
        var searchResultCount = currencySearchObj.runPaged().count;
        currencySearchObj.run().each(function (result) {
          currency_id = result.getValue(search_currency);
          return true;
        });
      } catch (error) {
        log.debug("fallo en busqueda de la moneda", error.message);
      }

      //#endregion
      //#region Búsqueda 8 ExternalID para crear o actualizar una PURCHASE ORDER

      if (po_externalid != "" && po_externalid != null) {
        try {
          var transactionSearchObj = search.create({
            type: "transaction",
            filters: [
              ["recordtype", "is", record.Type.PURCHASE_ORDER],
              "AND",
              ["mainline", "is", "T"],
              "AND",
              ["externalid", "is", po_externalid],
            ],
            columns: [
              (search_purchase = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = transactionSearchObj.runPaged().count;
          if (searchResultCount > 0) {
            transactionSearchObj.run().each(function (result) {
              purchaseid = result.getValue(search_purchase);
              return true;
            });
          } else {
            purchaseid = "";
          }
        } catch (error) {
          log.debug("Error", error.message);
        }
      } else {
        log.debug("El campo externalid es obligatorio.");
      }
      //#endregion
      try {
        if (purchaseid == "") {
          purchaseObj = record.create({
            type: record.Type.PURCHASE_ORDER,
            isDynamic: true,
          });

          purchaseObj.setValue({
            fieldId: "entity",
            value: vendor_id,
          });
          /*        purchaseObj.setValue({
            fieldId: "subsidiary",
            value: subsidiary_id,
          }); */
          purchaseObj.setValue({
            fieldId: "externalid",
            value: po_externalid,
          });
        } else {
          purchaseObj = record.load({
            type: record.Type.PURCHASE_ORDER,
            id: purchaseid,
            isDynamic: true,
          });
          purchaseObj.setValue({
            fieldId: "entity",
            value: vendor_id,
          });
        }
        
        purchaseObj.setValue({ fieldId: "trandate", value: po_trandate });
        purchaseObj.setValue({ fieldId: "exchangerate",value: parseFloat(po_exchangeRate)});
        purchaseObj.setValue({ fieldId: "currency", value: parseInt(currency_id) });
        purchaseObj.setValue({ fieldId: "employee", value: employee_id });
        purchaseObj.setValue({ fieldId: "department", value: department_id });
        purchaseObj.setValue({ fieldId: "class", value: clase_id });
        purchaseObj.setValue({ fieldId: "cseg_skan_suc", value: location_id });
        purchaseObj.setValue({ fieldId: "trandate", value: po_duedate });
        purchaseObj.setValue({ fieldId: "trandate", value: po_memo });
      } catch (error) {
        log.debug("falla en insertar cabeceras", error.message);
      }

      if (purchaseid == "") {
        try {
          datos.lines.forEach((line) => {

            let purchaseItemLine_item =line.purchaseItemLine_item
            let purchaseItemLine_quantity =line.purchaseItemLine_quantity
            let purchaseItemLine_units =line.purchaseItemLine_units
            let purchaseItemLine_rate =line.purchaseItemLine_rate
            let purchaseItemLine_amount =line.purchaseItemLine_amount
            let custrecord_mx_sat_to_code =line.custrecord_mx_sat_to_code
            let purchaseItemLine_description =line.purchaseItemLine_description
            let purchaseItemLine_department =line.purchaseItemLine_department
            let purchaseItemLine_class =line.purchaseItemLine_class
            let purchaseItemLine_location =line.purchaseItemLine_location

            

            let journalItemLine_departmentRef = line.journalItemLine_departmentRef;
            let journalItemLine_classRef = line.journalItemLine_classRef;
            let journalItemLine_locationRef = line.journalItemLine_locationRef;

            //#region Busquedas nivel line


            try {
              if (purchaseItemLine_department) {
                var departmentSearchObj = search.create({
                  type: "department",
                  filters: [
                    ["namenohierarchy", "is", purchaseItemLine_department],
                  ],
                  columns: [
                    (search_depart = search.createColumn({
                      name: "internalid",
                      label: "Internal ID",
                    })),
                  ],
                });
                var searchResultCount = departmentSearchObj.runPaged().count;
                log.debug(
                  "departmentSearchObj result count",
                  searchResultCount
                );
                departmentSearchObj.run().each(function (result) {
                  department_id = result.getValue(search_depart);
                  return true;
                });
              } else {
                department_id = "";
              }
            } catch (error) {
              department_id = "";
              log.debug("fallo en busqueda del departamento", error.message);
            }

            //Class
            try {
              if (journalItemLine_classRef) {
                var classificationSearchObj = search.create({
                  type: "classification",
                  filters: [["name", "is", journalItemLine_classRef]],
                  columns: [
                    search.createColumn({
                      name: "name",
                      sort: search.Sort.ASC,
                      label: "Name",
                    }),
                    (search_class = search.createColumn({
                      name: "internalid",
                      label: "Internal ID",
                    })),
                  ],
                });
                var searchResultCount =
                  classificationSearchObj.runPaged().count;
                log.debug(
                  "classificationSearchObj result count",
                  searchResultCount
                );
                classificationSearchObj.run().each(function (result) {
                  clase_id = result.getValue(search_class);

                  return true;
                });
              } else {
                clase_id = "";
              }
            } catch (error) {
              clase_id = "";
              log.debug("fallo en busqueda de la clase", error.message);
            }
            //Location
            try {
              if (journalItemLine_locationRef) {
                var locationSearchObj = search.create({
                  type: "location",
                  filters: [["name", "is", journalItemLine_locationRef]],
                  columns: [
                    (search_location = search.createColumn({
                      name: "internalid",
                      label: "Internal ID",
                    })),
                  ],
                });
                var searchResultCount = locationSearchObj.runPaged().count;
                log.debug("locationSearchObj result count", searchResultCount);
                locationSearchObj.run().each(function (result) {
                  location_id = result.getValue(search_location);
                  log.debug("location id", location_id);
                  return true;
                });
              } else {
                location_id = "";
              }
            } catch (error) {
              location_id = "";
              log.debug("fallo en busqueda de location", error.message);
            }
            //#endregion
            purchaseObj.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "account",
              value: jil_account_id,
            });
            purchaseObj
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "debit",
                value: journalItemLine_debitAmount,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "credit",
                value: journalItemLine_creditAmount,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "memo",
                value: journalItemLine_memo,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "custcol_skan_nota2",
                value: journalItemLine_custcol_skan_nota2,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "entity",
                value: entity_id,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "custcol_skan_contrato_retail",
                value: contrato_id,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "department",
                value: department_id,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "class",
                value: clase_id,
              })
              .setCurrentSublistValue({
                sublistId: "line",
                fieldId: "location",
                value: location_id,
              })
              .commitLine({
                sublistId: "line",
              });
            log.debug("commit", "commit realizado en la creación");
          });
        } catch (error) {
          log.debug("Error en la creación", error.message);
        }
      } else {
        try {
          datos.lines.forEach(function (line, index) {
            log.debug("Posicion en array", index);
            let journalItemLine_accountRef = line.journalItemLine_accountRef;
            let journalItemLine_debitAmount = line.journalItemLine_debitAmount;
            let journalItemLine_creditAmount =
              line.journalItemLine_creditAmount;
            let journalItemLine_memo = line.journalItemLine_memo;
            let journalItemLine_custcol_skan_nota2 = line.custcol_skan_nota2;
            let journalItemLine_entityRef = line.journalItemLine_entityRef;
            let journalItemLine_custcol_skan_contrato2 =
              line.cseg_skan_contrato;
            let journalItemLine_departmentRef =
              line.journalItemLine_departmentRef;
            let journalItemLine_classRef = line.journalItemLine_classRef;
            let journalItemLine_locationRef = line.journalItemLine_locationRef;

            log.debug(
              "Ya empieza la búsqueda a nivel línea -> contrato",
              journalItemLine_custcol_skan_contrato2
            );
            //#region Busquedas nivel line

            //JIL ACCOUNT ID
            try {
              var accountSearchObj = search.create({
                type: "account",
                filters: [
                  ["displayname", "contains", journalItemLine_accountRef],
                ],
                columns: [
                  (search_idacc = search.createColumn({
                    name: "internalid",
                    label: "Internal ID",
                  })),
                ],
              });
              var searchResultCount = accountSearchObj.runPaged().count;
              log.debug("accountSearchObj result count", searchResultCount);
              accountSearchObj.run().each(function (result) {
                jil_account_id = result.getValue(search_idacc);
                return true;
              });
            } catch (error) {
              jil_account_id = "";
              log.debug("Error busqueda cuenta item", error.message);
            }

            try {
              var customerSearchObj = search.create({
                type: "customer",
                filters: [["externalid", "is", journalItemLine_entityRef]],
                columns: [
                  (search_entity = search.createColumn({
                    name: "internalid",
                    label: "Internal ID",
                  })),
                ],
              });
              var searchResultCount = customerSearchObj.runPaged().count;
              log.debug("customerSearchObj result count", searchResultCount);
              customerSearchObj.run().each(function (result) {
                entity_id = "";
                entity_id = result.getValue(search_entity);
                return true;
              });
            } catch (error) {
              entity_id = "";
              log.debug("Error recuperando id de cliente");
            }

            /*      try {
              var customerSearchObj = search.create({
                type: "customer",
                filters: [["externalid", "is", journalItemLine_entityRef]],
                columns: [
                  (search_entity = search.createColumn({
                    name: "internalid",
                    label: "Internal ID",
                  })),
                ],
              });
              var searchResultCount = customerSearchObj.runPaged().count;
              log.debug("customerSearchObj result count", searchResultCount);
              customerSearchObj.run().each(function (result) {
                entity_id = result.getValue(search_entity);
                return true;
              });
            } catch (error) {
              entity_id = "";
              log.debug("Error recuperando id de cliente");
            } */

            try {
              if (journalItemLine_custcol_skan_contrato2) {
                log.debug(
                  "tipo de dato recuperado contrato",
                  typeof journalItemLine_custcol_skan_contrato2
                );
                var customrecord_skan_contratosSearchObj = search.create({
                  type: "customrecord_skan_contratos",
                  filters: [
                    ["name", "is", journalItemLine_custcol_skan_contrato2],
                  ],
                  columns: [
                    (search_contrato = search.createColumn({
                      name: "internalid",
                      label: "Internal ID",
                    })),
                  ],
                });
                var searchResultCount =
                  customrecord_skan_contratosSearchObj.runPaged().count;
                customrecord_skan_contratosSearchObj
                  .run()
                  .each(function (result) {
                    contrato_id = "";
                    contrato_id = result.getValue(search_contrato);
                    log.debug("Encontramos un contrato", contrato_id);
                    return true;
                  });
              } else {
                contrato_id = "";
              }
            } catch (error) {
              contrato_id = "";
              log.debug("Error recuperando id de cliente");
            }

            //Department
            try {
              if (purchaseItemLine_department) {
                var departmentSearchObj = search.create({
                  type: "department",
                  filters: [
                    ["namenohierarchy", "is", purchaseItemLine_department],
                  ],
                  columns: [
                    (search_depart = search.createColumn({
                      name: "internalid",
                      label: "Internal ID",
                    })),
                  ],
                });
                var searchResultCount = departmentSearchObj.runPaged().count;
                log.debug(
                  "departmentSearchObj result count",
                  searchResultCount
                );
                departmentSearchObj.run().each(function (result) {
                  department_id = result.getValue(search_depart);
                  log.debug("department result ID", department_id);
                  return true;
                });
              } else {
                department_id = "";
              }
            } catch (error) {
              department_id = "";
              log.debug("fallo en busqueda del departamento", error.message);
            }

            //Class
            try {
              var classificationSearchObj = search.create({
                type: "classification",
                filters: [["name", "is", journalItemLine_classRef]],
                columns: [
                  search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name",
                  }),
                  (search_class = search.createColumn({
                    name: "internalid",
                    label: "Internal ID",
                  })),
                ],
              });
              var searchResultCount = classificationSearchObj.runPaged().count;
              log.debug(
                "classificationSearchObj result count",
                searchResultCount
              );
              classificationSearchObj.run().each(function (result) {
                clase_id = result.getValue(search_class);

                return true;
              });
            } catch (error) {
              clase_id = "";
              log.debug("fallo en busqueda de la clase", error.message);
            }
            //Location
            try {
              var locationSearchObj = search.create({
                type: "location",
                filters: [["name", "is", journalItemLine_locationRef]],
                columns: [
                  (search_location = search.createColumn({
                    name: "internalid",
                    label: "Internal ID",
                  })),
                ],
              });
              var searchResultCount = locationSearchObj.runPaged().count;
              log.debug("locationSearchObj result count", searchResultCount);
              locationSearchObj.run().each(function (result) {
                location_id = result.getValue(search_location);
                return true;
              });
            } catch (error) {
              location_id = "";
              log.debug("fallo en busqueda de location", error.message);
            }
            //#endregion
            let itemcount = purchaseObj.getLineCount({
              sublistId: "line",
            });

            if (index < itemcount) {
              log.debug("Valor del MEMO", journalItemLine_memo);
              purchaseObj.selectLine({
                sublistId: "line",
                line: index,
              });
              purchaseObj.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "account",
                value: jil_account_id,
              });
              purchaseObj
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "debit",
                  value: journalItemLine_debitAmount,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "credit",
                  value: journalItemLine_creditAmount,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "memo",
                  value: journalItemLine_memo,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "custcol_skan_nota2",
                  value: journalItemLine_custcol_skan_nota2,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "entity",
                  value: entity_id,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "custcol_skan_contrato_retail",
                  value: contrato_id,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "department",
                  value: department_id,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "class",
                  value: clase_id,
                })
                .setCurrentSublistValue({
                  sublistId: "line",
                  fieldId: "location",
                  value: location_id,
                })
                .commitLine({
                  sublistId: "line",
                });
              log.debug("commit", "commit realizado en actualización");
            }
          });
        } catch (error) {
          log.debug("Error en la actualización", error.message);
        }
      }

      try {
        let idObj = purchaseObj.save({
          ignoreMandatoryFields: true,
        });
        log.debug("Se crea el journal", idObj);
      } catch (error) {
        log.debug("Falló la journal", error);
      }
    } catch (error) {
      log.debug(
        "Falla en el servicio apra crear Ordenes de Compra",
        error.message
      );
    }
  };
  /**
   * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
   * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
   * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
   *     provided automatically based on the results of the map stage.
   * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
   *     reduce function on the current group
   * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
   * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {string} reduceContext.key - Key to be processed during the reduce stage
   * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
   *     for processing
   * @since 2015.2
   */
  const reduce = (reduceContext) => {};

  /**
   * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
   * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
   * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
   * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
   *     script
   * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
   * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
   * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
   * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
   *     script
   * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
   * @param {Object} summaryContext.inputSummary - Statistics about the input stage
   * @param {Object} summaryContext.mapSummary - Statistics about the map stage
   * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
   * @since 2015.2
   */
  const summarize = (summaryContext) => {
    const contentfromget = JSON.parse(
      runtime
        .getCurrentScript()
        .getParameter({ name: "custscript_parametrointerco" })
    );
    fileId = contentfromget.idxls;
    folderId = contentfromget.folderselec;
    try {
      let fileObj = file.load({
        id: fileId,
      });

      if (folderId === 2064) {
        fileObj.folder = 2064;
      }
      fileObj.save();
      log.debug("SE GUARDÓ EL DOCUMENTO");
    } catch (error) {
      log.debug("Fallo en: ", error.message);
    }
  };

  //Function Area
  function excelFileToJson(fileId, headers) {
    var returnData = [];
    var excelFile = file.load({
      id: fileId,
    });

    var workbook = XLSX.read(excelFile.getContents(), { type: "base64" });
    for (var sn in workbook.SheetNames) {
      var sheet = workbook.Sheets[workbook.SheetNames[sn]];
      returnData.push(
        isEmpty(headers) || isEmpty(headers[workbook.SheetNames[sn]])
          ? XLSX.utils.sheet_to_json(sheet)
          : XLSX.utils.sheet_to_json(sheet, headers[workbook.SheetNames[sn]])
      );
    }
    return returnData;
  }

  function isEmpty(value) {
    if (value == undefined || value == null) return true;
    if (
      util.isNumber(value) ||
      util.isBoolean(value) ||
      util.isDate(value) ||
      util.isFunction(value)
    )
      return false;
    if (util.isString(value)) return value.length == 0 ? true : false;
    return Object.keys(value).length == 0 ? true : false;
  }
  function transformdate(vardate) {
    /* let a=vardate.slice(1,11) */
    let a = vardate;
    if (typeof a === "number") {
      var fecha = new Date(Math.round((a - 25568) * 86400 * 1000));
    } else {
      var a1 = a.split("/");
      var fecha = new Date(a1[1] + "/" + a1[0] + "/" + a1[2]);
    }
    return fecha;
  }

  return { getInputData, map, reduce, summarize };
});
