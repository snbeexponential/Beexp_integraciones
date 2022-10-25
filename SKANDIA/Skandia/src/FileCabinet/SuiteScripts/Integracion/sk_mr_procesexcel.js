/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NAmdConfig ../excel_module/sk_sc_excel_conf.json
 */
define(["N/email", "N/file", "N/record", "N/search", "xlsx", "N/runtime"]
/**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 */, (email, file, record, search, XLSX, runtime) => {
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
  var invObj;
  let journalid;
  let subsidiary_id;
  let currency_id;
  let postingperiod_id;
  let externalid;
  let subsidiary_search;

  let entity_id;
  let contrato_id;
  let department_id;
  let class_id;
  let location_id;

  const getInputData = (inputContext) => {
    const contentfromget = JSON.parse(
      runtime
        .getCurrentScript()
        .getParameter({ name: "custscript_sk_mr_idvalue" })
    );
    documentId = contentfromget.idxls;
    folderId = contentfromget.folderselec;

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
          subsidiary: element.subsidiary || null,
          currency: element.currency || null,
          exchangerate: element.exchangerate || null,
          postingperiod: element.postingperiod || null,
          tranDate: element.tranDate ? element.tranDate : "",
          reversalDate: element.reversalDate ? element.reversalDate : "",
          isDeferred: element.isDeferred || null,
        
        };
        arreglimto[flag1].lines.push({

          journalItemLine_accountRef:
            element.journalItemLine_accountRef || null,
          journalItemLine_debitAmount:
            element.journalItemLine_debitAmount || null,
          journalItemLine_creditAmount:
            element.journalItemLine_creditAmount || null,
          journalItemLine_memo: element.journalItemLine_memo || null,
          custcol_skan_nota2: element.custcol_skan_nota2 || null,
          journalItemLine_entityRef: element.journalItemLine_entityRef || null,
          cseg_skan_contrato: element.cseg_skan_contrato || null,
          journalItemLine_departmentRef:
            element.journalItemLine_departmentRef || null,
          journalItemLine_classRef: element.journalItemLine_classRef || null,
          journalItemLine_locationRef:
            element.journalItemLine_locationRef || null,
          journalItemLine_taxCodeRef:
            element.journalItemLine_taxCodeRef || null,
          journalItemLine_taxCodeAmount:
            element.journalItemLine_taxCodeAmount || null,
        
        
        });

        flag1++;
      } else {
        var newindex = flag1 - 1;
        arreglimto[newindex].lines.push({
          journalItemLine_accountRef:
            element.journalItemLine_accountRef || null,
          journalItemLine_debitAmount:
            element.journalItemLine_debitAmount || null,
          journalItemLine_creditAmount:
            element.journalItemLine_creditAmount || null,
          journalItemLine_memo: element.journalItemLine_memo || null,
          custcol_skan_nota2: element.custcol_skan_nota2 || null,
          journalItemLine_entityRef: element.journalItemLine_entityRef || null,
          cseg_skan_contrato: element.cseg_skan_contrato || null,
          journalItemLine_departmentRef:
            element.journalItemLine_departmentRef || null,
          journalItemLine_classRef: element.journalItemLine_classRef || null,
          journalItemLine_locationRef:
            element.journalItemLine_locationRef || null,
          journalItemLine_taxCodeRef:
            element.journalItemLine_taxCodeRef || null,
          journalItemLine_taxCodeAmount:
            element.journalItemLine_taxCodeAmount || null,
        });
      }
    });
    return arreglimto;
  };
  /**
   * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
   * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
   * context.
   * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
   *     is provided automatically based on the results of the getInputData stage.
   * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
   *     function on the current key-value pair
   * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
   *     pair
   * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
   *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
   * @param {string} mapContext.key - Key to be processed during the map stage
   * @param {string} mapContext.value - Value to be processed during the map stage
   * @since 2015.2
   */

  const map = (mapContext) => {
    try {
      var datos = JSON.parse(mapContext.value);

      //#region Cabecera
        externalid = datos.cabecera.externalid; //hecha la busqueda del external id
        subsidiary_search = datos.cabecera.subsidiary; //Cadena para buscar subsidiary "Parent Company : " +
      //#region  C .- Subsidiary
try {
    var subsidiarySearchObj = search.create({
        type: "subsidiary",
        filters:
        [
           ["namenohierarchy","is",subsidiary_search]
        ],
        columns:
        [
            search_idsub=search.createColumn({name: "internalid", label: "Internal ID"}),
           /* search.createColumn({name: "namenohierarchy", label: "Name (no hierarchy)"}) */
        ]
     });
     var searchResultCount = subsidiarySearchObj.runPaged().count;
     log.debug("subsidiarySearchObj result count",searchResultCount);
     subsidiarySearchObj.run().each(function(result){
        subsidiary_id = result.getValue(search_idsub);
        log.debug( "Se recuepera subsidiary_id",subsidiary_id )
        return true;
    });
} catch (error) {
    subsidiary_id=''
    log.debug("Error en la busqueda subsidiaria", error.message);
}
/* 
      try {
        var subsidiarySearchObj = search.create({
          type: "subsidiary",
          filters: [["name", "is", subsidiary_search]],
          columns: [
            (search_idsub = search.createColumn({
              name: "internalid",
              label: "Internal ID",
            })),
          ],
        });
        var searchResultCount = subsidiarySearchObj.runPaged().count;
        subsidiarySearchObj.run().each(function (result) {
            subsidiary_id = result.getValue(search_idsub);
            subsidiary_id=12
            return true;
        });
        log.debug( "Se recuepera algo ?? subsidiary_id",subsidiary_id )
    } catch (error) {
        log.debug("Error en la busqueda subsidiaria", error.message);
      }
        */
      
      //#endregion
      //#endregion
      //#region E.- Posting period
      let postingperiod = datos.cabecera.postingperiod;
      try {
        if (postingperiod) {
          var accountingperiodSearchObj = search.create({
            type: "accountingperiod",
            filters: [["periodname", "is", postingperiod]],
            columns: [
              (search_postp = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = accountingperiodSearchObj.runPaged().count;
          accountingperiodSearchObj.run().each(function (result) {
            postingperiod_id = result.getValue(search_postp);
            return true;
          });
        } else {
          postingperiod_id = "";
        }
      } catch (error) {
        postingperiod_id = "";
        log.debug("Error en la busqueda posting period", error.message);
      }
      //#endregion

      let currency = datos.cabecera.currency;
      //#region Currency
      try {
        var currencySearchObj = search.create({
          type: "currency",
          filters: [["name", "is", currency]],
          columns: [
            search.createColumn({
              name: "name",
              sort: search.Sort.ASC,
              label: "Name",
            }),
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

      let tranDate;
      let reversalDate;
      let exchangerate;
      let isDeferred;

      try {
        tranDate = transformdate(datos.cabecera.tranDate);
        reversalDate = transformdate(datos.cabecera.reversalDate);
        exchangerate = datos.cabecera.exchangerate;
        isDeferred = datos.cabecera.isDeferred == "true" ? true : false;
      } catch (error) {
        log.debug("error en campos", error.message);
      }
      //#endregion
      if (externalid != "" && externalid != null) {
        try {
          var transactionSearchObj = search.create({
            type: "transaction",
            filters: [
              ["recordtype", "is", record.Type.JOURNAL_ENTRY],
              "AND",
              ["mainline", "is", "T"],
              "AND",
              ["externalid", "is", externalid],
            ],
            columns: [
              (search_invoice = search.createColumn({
                name: "internalid",
                label: "Internal ID",
              })),
            ],
          });
          var searchResultCount = transactionSearchObj.runPaged().count;
          if (searchResultCount > 0) {
            transactionSearchObj.run().each(function (result) {
              journalid = result.getValue(search_invoice);
              return true;
            });
          } else {
            journalid = "";
          }
        } catch (error) {
          log.debug("Error", error.message);
        }
      } else {
        log.debug("El campo externalid es obligatorio.");
      }
      try {
        if (journalid == "") {
          invObj = record.create({
            type: record.Type.JOURNAL_ENTRY,
            isDynamic: true,
          });
          invObj.setValue({
            fieldId: "subsidiary",
            value: subsidiary_id,
          });

          invObj.setValue({
            fieldId: "externalid",
            value: externalid,
          });
        } else {
          invObj = record.load({
            type: record.Type.JOURNAL_ENTRY,
            id: journalid,
            isDynamic: true,
          });
        }
        invObj.setValue({ fieldId: "trandate", value: tranDate });

        invObj.setValue({
          fieldId: "exchangerate",
          value: parseFloat(exchangerate),
        });

        invObj.setValue({
          fieldId: "postingperiod",
          value: postingperiod_id == null ? "" : postingperiod_id,
        });
        log.debug("postingperiod_id Contenido", postingperiod_id);

        invObj.setValue({ fieldId: "currency", value: parseInt(currency_id) });
      } catch (error) {
        log.debug("falla en este bloque", error.message);
      }

      if (journalid == "") {
        try {
          datos.lines.forEach((line) => {
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
              "Ya empieza la búsqueda a nivel línea ->CONTRATO",
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
              if (journalItemLine_entityRef) {
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
                  entity_id=''
                  entity_id = result.getValue(search_entity);
                  return true;
                });
              } else {
                entity_id = "";
              }
            } catch (error) {
              entity_id = "";
              log.debug("Error recuperando id de cliente 369", error.message);
            }
            try {
              if (journalItemLine_custcol_skan_contrato2) {
                log.debug("tipo de dato recuperado contrato" , journalItemLine_custcol_skan_contrato2)
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
                    contrato_id = result.getValue(search_contrato);
                    log.debug("Encontramos un contrato" ,contrato_id )
                    return true;
                  });
              } else {
                contrato_id = "";
              }
            } catch (error) {
              contrato_id = "";
              log.debug("Error recuperando id de contrato 391");
            }

            //Department
            try {
              if (journalItemLine_departmentRef) {
                var departmentSearchObj = search.create({
                  type: "department",
                  filters: [["namenohierarchy", "is", journalItemLine_departmentRef]],
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
                  class_id = result.getValue(search_class);

                  return true;
                });
              } else {
                class_id = "";
              }
            } catch (error) {
              class_id = "";
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
            invObj.setCurrentSublistValue({
              sublistId: "line",
              fieldId: "account",
              value: jil_account_id,
            });
            invObj.setCurrentSublistValue({
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
                value: class_id,
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
                    filters:
                    [
                        ["externalid", "is", journalItemLine_entityRef]
                    ],
                    columns:
                    [
                       search_entity=search.createColumn({name: "internalid", label: "Internal ID"})

                    ]
                 });
                 var searchResultCount = customerSearchObj.runPaged().count;
                 log.debug("customerSearchObj result count",searchResultCount);
                 customerSearchObj.run().each(function(result){
                    entity_id = ''
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
                    log.debug( "tipo de dato recuperado contrato",typeof(journalItemLine_custcol_skan_contrato2 ))
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
                        log.debug("Encontramos un contrato" ,contrato_id )
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
              if (journalItemLine_departmentRef) {
                var departmentSearchObj = search.create({
                  type: "department",
                  filters: [["namenohierarchy", "is", journalItemLine_departmentRef]],
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
                  log.debug(
                    "department result ID",
                    department_id
                  );
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
                class_id = result.getValue(search_class);

                return true;
              });
            } catch (error) {
              class_id = "";
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
            let itemcount = invObj.getLineCount({
              sublistId: "line",
            });

            if (index < itemcount) {

                log.debug("Valor del MEMO",journalItemLine_memo )
              invObj.selectLine({
                sublistId: "line",
                line: index,
              });
              invObj.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "account",
                value: jil_account_id,
              });
              invObj
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
                  value: class_id,
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
        let idObj = invObj.save({
          ignoreMandatoryFields: true,
        });
        log.debug("Se crea el journal", idObj);
      } catch (error) {
        log.debug("Falló la journal", error);
      }
    } catch (error) {
      log.debug(
        "Falla en el servicio apra crear journal entryes",
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
        .getParameter({ name: "custscript_sk_mr_idvalue" })
    );
    fileId = contentfromget.idxls;
    folderId = contentfromget.folderselec;
    try {
      let fileObj = file.load({
        id: fileId,
      });
      /*folders De Recibido={
        cuentas:1526,
        nomina:1533,
        siniestros:1528,
        inversiones:1527
        } */
      /*folders A Depositar={
        cuentas:1531,
        nomina:1534,
        siniestros:1529,
        inversiones:1530
        } */

      if (folderId === 1526) {
        fileObj.folder = 1531;
      } else if (folderId === 1533) {
        fileObj.folder = 1534;
      } else if (folderId === 1528) {
        fileObj.folder = 1529;
      } else if (folderId === 1527) {
        fileObj.folder = 1530;
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
