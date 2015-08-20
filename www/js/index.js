/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.

rc2016_conexion es la variable localstorage para ver si hay conexion
rc2016_notfirstime es la variable localstorage para ver si es el primer ingreso
 */
 //variables globales de DDBB
 var db;
var shortName = 'rc2016';
var version = '1.0';
var displayName = 'rc2016';
var maxSize = 65535;

monthNames = ["","ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        $(".button-collapse").sideNav({menuWidth: 240, activationWidth: 70});
        $("#nav_listado").hide();
        $("#insert_message").hide();
        document.addEventListener("online", onOnline, false);
        document.addEventListener("offline", onOffline, false);        
        app.receivedEvent('deviceready');
        chequearconexion();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

function onOnline(){
    window.localStorage.setItem("rc2016_conexion", "1");
}

function onOffline(){
    window.localStorage.setItem("rc2016_conexion", "0");
}

function chequearconexion(){
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = '1';
    states[Connection.ETHERNET] = '2';
    states[Connection.WIFI]     = '3';
    states[Connection.CELL_2G]  = '4';
    states[Connection.CELL_3G]  = '5';
    states[Connection.CELL_4G]  = '6';
    states[Connection.CELL]     = '7';
    states[Connection.NONE]     = '8';
    console.log('Connection type: ' + states[networkState]);
    if (states[networkState] == "8" || states[networkState] == "1") { 
        window.localStorage.setItem("rc2016_conexion", "0");
        console.log("no hay conexion");
    } else {
       window.localStorage.setItem("rc2016_conexion", "1");
        console.log("hay conexion de algun tipo");
    }
    geolocalizar();
}

function geolocalizar(){
    console.log("geolocalizando...");
    var geooptions = { maximumAge: 600000, timeout: 7500, enableHighAccuracy: true};
    navigator.geolocation.getCurrentPosition(GeoonSuccess, GeoonError,geooptions);
}
    // onSuccess Geolocation
    function GeoonSuccess(position) {
        console.log("geolocation ok");
        window.localStorage.setItem("rc2016_lat", position.coords.latitude);
        window.localStorage.setItem("rc2016_lon", position.coords.longitude);
        console.log("latitude: " + position.coords.latitude);
        console.log("longitude: " + position.coords.longitude);
        generar_contenido();    
    }

    function GeoonError(error) {
        console.log(error.code + error.message);
        //por default location at congreso, kilómetros cero
        window.localStorage.setItem("rc2016_lat", "-34.609772");
        window.localStorage.setItem("rc2016_lon", "-58.392363");
        console.log("latitude def: -34.609772");
        console.log("longitude def: -58.392363");
        generar_contenido();
    }

function generar_contenido() {
    console.log("open database: " + shortName + " version: " + version + "dis name: " + displayName + "size: " + maxSize);
    db = openDatabase(shortName, version, displayName, maxSize);
    console.log("primera vez" + window.localStorage.getItem("rc2016_firstime"));
    if (window.localStorage.getItem("rc2016_firstime") === null || window.localStorage.getItem("rc2016_firstime") == "0") {
        console.log("creando tablasparapato");
        crear_tablas();
    } else {
        console.log("obtener_contenido from db");
        mostrar_contenido();
    }
}

function crear_tablas(){
    db.transaction(function(tx){
        console.log("creacionDB");
        var sql3 = "CREATE TABLE IF NOT EXISTS carreras (id_carrera INTEGER PRIMARY KEY,carrera TEXT,nro_carrera INTEGER,carreras_totales INTEGER,fecha TEXT,categoria TEXT,id_categoria INTEGER,categoria_short TEXT,destacado INTEGER,latitud TEXT,longitud TEXT,id_circuito INTEGER,circuito TEXT,extension DECIMAL,imagen TEXT)";
        tx.executeSql(sql3);
    },funcionvacia,traer_contenido,transaction_error);

}

function funcionvacia(){
    console.log("query exec ok");
}

function transaction_error(tx, error) {
    console.log('OKA: ' + error.message + ' code: ' + error.code);
}

function traer_contenido(){
    if (window.localStorage.getItem("rc2016_conexion") == "1") {
        console.log("traemos el json");
        var a = Math.floor(Date.now() / 1000);
        window.localStorage.setItem("rc2016_last_act", a);
        $.post("http://autowikipedia.es/phonegap/racing_calendar_eventos_anual.php", function(data) {
            console.log("cantidad resultados a insertar: " + data.length);
            $.each(data, function(i, item) {
                insertar_contenido(item, data.length);
            });
        },"json");
    } else {
        navigator.notification.alert("Necesitamos conexion para el primer uso", mostrar_contenido,"De 0 a 100 km/h", "Reintentar");
        //Materialize.toast('Necesitamos conexion para el primer uso', 4000)
        console.log("no hay conexion para primer uso");
    }
}

numero_insert = 1;
function insertar_contenido(item,total) {
    db.transaction(function(tx) {
    tx.executeSql('INSERT INTO carreras (id_carrera,carrera,nro_carrera,carreras_totales,fecha,categoria,id_categoria,categoria_short,destacado,latitud,longitud,id_circuito,circuito,extension,imagen) Values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [item.id_carrera,item.carrera,item.nro_fecha,item.nro_fecha,item.fecha,item.categoria,item.categoria_id,item.categoria_short,item.destacado,item.latitud,item.longitud,item.circuito_id,item.circuito,item.extension,item.imagen], function(tx, results){ //funcion para mensaje
            console.log("insert nro: " + numero_insert);
            console.log("insert data: " + item.id_carrera+ " " +item.carrera+ " " +item.nro_fecha+ " " +item.nro_fecha+ " " +item.fecha+ " " +item.categoria+ " " +item.categoria_id+ " " +item.categoria_short+ " " +item.destacado+ " " +item.latitud+ " " +item.longitud+ " " +item.circuito_id+ " " +item.circuito+ " " +item.extension+ " " +item.imagen);
            numero_insercion(numero_insert,total);
            //muestro el html cuando se insertar el ultimo 
            if (total == numero_insert) {
                mostrar_contenido();
                window.localStorage.setItem("rc2016_firstime","1");
            }
            ++numero_insert;
        },transaction_error);
    });
}

function numero_insercion(numero,total){
    if (numero == 1) {
        $("#insert_message").show();
        $(".loading").hide();
    }

    $("#insert_message_text").text(numero);
    
    if (numero == total) {
        $("#insert_message").hide();
        $(".loading").show();
    }
}
/*
function traer_capitulo(id_serie) {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM series_se WHERE id_serie=? AND visto=1 ORDER BY modificado DESC LIMIT 1', [id_serie],mostrar_capitulos,nullHandler("tx datos capitulo"),transaction_error);
  });
}
*/
function mostrar_contenido(){
    //strftime('%m', fecha) as mes 
    var per = get_dias_periodo();
    console.log("fechas query" + per.fecha_inicial + per.fecha_final);
    console.log("seleccionamos from db");
    db.transaction(function(tx) {
    tx.executeSql("SELECT *,strftime('%m', fecha) as mes,strftime('%d', fecha) as dia FROM carreras where fecha BETWEEN '" + per.fecha_inicial + "' AND '" + per.fecha_final + "' ", [],get_contenido_db,funcionvacia(),transaction_error);
  });
}

function get_contenido_db(tx, result) {
    console.log("get_contenido_db");
    $(".loading").hide();
    var eventos = $('#eventos').empty();
    //var row = result.rows.item;
    if (result.rows.length == 0) {
        eventos.append('<div class="row">' +
                  '<div class="col s12 m12">' +
                    '<div class="card">' +
                      '<div class="card-content no_eventos">' +
                          '<i class="material-icons">&#xE002;</i> No events this week.' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>');        
    } else {
        var hay_conexion = window.localStorage.getItem("rc2016_conexion");
        var row = result.rows.item;
        for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows.item(i);
            //console.log(row);
            var distancia; var circuito; var nro_fecha; var destacado; var foto;   
            //nombre corto para categoria si el nombre es largo
            if (row.categoria.length > 15) {
                var categoria = row.categoria_short;
            }
            else {
                var categoria = row.categoria;
            }
            //destacados
            if (row.destacado == "1") {
                 destacado = '<i class="material-icons medium right blue-text  text-accent-3">&#xE8D0;</i>' ;
            }
            else {
                 destacado = "";
            }
            //buscamos la distancia siempre que el circuito no sea el "240"
            if (row.id_circuito != "240") {
                var lat = window.localStorage.getItem("rc2016_lat");
                var lon = window.localStorage.getItem("rc2016_lon");
                var p1 = LatLon(Geo.parseDMS(lat), Geo.parseDMS(lon));
                var p2 = LatLon(Geo.parseDMS(row.latitud), Geo.parseDMS(row.longitud));
                distancia = '<i class="material-icons">&#xE0C8;</i> ' + Math.ceil(p1.distanceTo(p2)) + "  kms ";
                circuito = '<i class="material-icons">&#xE531;</i> ' + row.circuito;
            }
            else {
                distancia = '<i class="material-icons">&#xE0C7;</i>';
                circuito = '<i class="material-icons">&#xE531;</i> - ';
            }
            if (row.nro_carrera > 0 ){
                nro_fecha = " Round" + row.nro_carrera;
            }
            else {
                nro_fecha = "";
            }
            //foto = 'racing_calendar_pics/cat_id_1/foto-1.jpg';
            if (hay_conexion == 1) {
                foto = row.imagen;
            } else {
                foto = 'racing_calendar_pics/cat_id_' + row.id_categoria + '/foto-1.jpg';
            }
            eventos.append('<div class="row">' +
                          '<div class="col s12 m12">' +
                            '<div class="card flow-text" data-id_categoria="' + row.id_categoria + '">' +
                              '<div class="card-image">' +
                                '<img src="' + foto + '">' +
                            '<span class="card-title"><strong>' + categoria + ':</strong> ' + row.carrera + '</span>' +
                              '</div>' +
                              '<div class="card-content">' +
                                '<div class="col s10">' +
                                  '<p><i class="material-icons">today</i><strong>'+ monthNames[parseInt(row.mes)] + parseInt(row.dia) +' </strong>'+ nro_fecha + '</p>' +
                                  '<p>' + distancia + '</p>' +
                                  '<p>' + circuito + '</p>' +
                                '</div>'  +
                                '<div class="col s2 destacado">' +
                                    destacado +
                                '</div>'  +
                              '</div>' +
                            '</div>' +
                          '</div>' +
                        '</div>');            
        } // for
    } //else
    sync_process();
}

$("#rango_fechas").on('click',".anterior_se",function(e) {
    e.preventDefault();
    var posicion_inicial = $("#rango_fechas").data("posicion");
    var posicion_se = posicion_inicial - 1;
    $("#rango_fechas").data("posicion", posicion_se);
    mostrar_contenido();
    
});

$("#rango_fechas").on('click',".siguiente_se",function(e) {
    e.preventDefault();
    var posicion_inicial = $("#rango_fechas").data("posicion");
    var posicion_se = posicion_inicial + 1;
    $("#rango_fechas").data("posicion", posicion_se);
    mostrar_contenido();   
});

function get_dias_periodo() {
    var $rango_fechas = $("#rango_fechas");
    var semana = $("#rango_fechas").data("posicion");
    var now = new Date();
    var lunes; var domingo;
    if (semana < 0) {
      lunes = new Date(now.setDate(now.getDate() - now.getDay() + 1 + (semana * 7)));
    } else {
      lunes = new Date(now.setDate(now.getDate() - now.getDay() + (1 + (semana * 7))));
    }
    //el domingo siempre son 7 dias a partir del lunes establecido
    domingo = new Date(now.setDate(now.getDate() - now.getDay() + 7));

    $rango_fechas.empty();
    $rango_fechas.append('<span class="flow-text" style="font-size:1.9em;"><i class="mdi-hardware-keyboard-arrow-left anterior_se"></i><strong>' + monthNames[(lunes.getMonth()+1)] + '</strong>' + lunes.getDate() + '<strong> / ' + monthNames[(domingo.getMonth()+1)] + '</strong>' + domingo.getDate() + ' <i class="mdi-hardware-keyboard-arrow-right siguiente_se"></i></span>');

    return {
        "fecha_inicial": lunes.yyyymmdd(),
        "fecha_final": domingo.yyyymmdd()
    }; 
}

Date.prototype.yyyymmdd = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
};


function sync_process(){
    var hay_conexion = window.localStorage.getItem("rc2016_conexion");
    var a = window.localStorage.getItem("rc2016_last_act");
    console.log("proceso sync starts" + a);
    if (hay_conexion == "1") {
        var url = "http://autowikipedia.es/phonegap/racing_calendar_eventos_sync.php?fecha_actualizacion=" + a;
        console.log(url); 
        $.post(url, function(data) {
            if (data[0].resultados == 0) {
                console.log("no new data to sync");
                var a = Math.floor(Date.now() / 1000);
                window.localStorage.setItem("rc2016_last_act", a);
                console.log("ultima actualizacion: " + a);
            } else {
                $.each(data, function(i, item) {
                    if (item.tipo_sentencia == 'UPDATE') {
                        updatear_contenido_sync(item, data[0].resultados, i);
                    } else if (item.tipo_sentencia == 'INSERT'){
                        insertar_contenido_sync(item, data[0].resultados, i);
                    } else if (item.tipo_sentencia == 'DELETE'){
                        borrar_contenido_sync(item, data[0].resultados, i);
                    }
                    //console.log(item);
                    //console.log(data.length);
                });
            }
        },"json"); 
    } else {
        console.log("no conection for sync, maybe later");
    }
}

function updatear_contenido_sync(item,total,numero_insert_sync) {
    console.log("syncing update");
    var a = Math.floor(Date.now() / 1000);
    db.transaction(function(tx) {
    tx.executeSql(item.sentencia, [item.carrera,item.nro_carrera,item.carreras_totales,item.fecha,item.categoria,item.categoria_id,item.categoria_short,item.destacado,item.latitud,item.longitud,item.circuito_id,item.circuito,item.extension,item.imagen,item.id_carrera], function(tx, results){ //funcion para mensaje
            //muestro el html cuando se insertar el ultimo 
            if (total == numero_insert_sync) {
                //ultima actualizacion
                window.localStorage.setItem("rc2016_last_act", a);
                console.log("ultima actualizacion: " + a);
                mostrar_contenido();
            }
        },transaction_error);
    });
}

function insertar_contenido_sync(item,total,numero_insert_sync) {
    console.log("syncing insert");
    var a = Math.floor(Date.now() / 1000);
    db.transaction(function(tx) {
    tx.executeSql(item.sentencia, [item.id_carrera,item.carrera,item.nro_carrera,item.carreras_totales,item.fecha,item.categoria,item.categoria_id,item.categoria_short,item.destacado,item.latitud,item.longitud,item.circuito_id,item.circuito,item.extension,item.imagen], function(tx, results){ //funcion para mensaje
            //muestro el html cuando se insertar el ultimo 
            if (total == numero_insert_sync) {
                //ultima actualizacion
                window.localStorage.setItem("rc2016_last_act", a);
                console.log("ultima actualizacion: " + a);
                mostrar_contenido();
            }
        },transaction_error);
    });
}

function borrar_contenido_sync(item,total,numero_insert_sync) {
    console.log("syncing delete");
    var a = Math.floor(Date.now() / 1000);
    db.transaction(function(tx) {
    tx.executeSql(item.sentencia, [item.id_carrera], function(tx, results){ //funcion para mensaje
            //muestro el html cuando se insertar el ultimo 
            if (total == numero_insert_sync) {
                //ultima actualizacion
                window.localStorage.setItem("rc2016_last_act", a);
                console.log("ultima actualizacion: " + a);
                mostrar_contenido();
            }
        },transaction_error);
    });
}


// click de card
$("#eventos").on('click',".card",function(e) {
   e.preventDefault();
   console.log("listado:" + $(this).data("id_categoria"));
   mostrar_contenido_listado($(this).data("id_categoria"));
});

// click de sidebar
$(document).on('click',".side_click",function(e) {
   e.preventDefault();
   console.log("listado:" + $(this).data("id_categoria"));
   mostrar_contenido_listado($(this).data("id_categoria"));
   $("#sidenav-overlay").trigger("click");
});

function mostrar_contenido_listado(id_categoria) {
    db.transaction(function(tx) {
    tx.executeSql("SELECT *,strftime('%m', fecha) as mes,strftime('%d', fecha) as dia FROM carreras where id_categoria=?", [id_categoria],get_listado_db,funcionvacia(),transaction_error);
  });
}

var hoy = new Date();
var siguiente_carrera = 0;
function get_listado_db(tx, result){
    $("#nav_eventos").hide();
    $("#nav_listado").show();
    var eventos = $('#eventos').empty();
    var categoria;
    console.log(result.rows.length);
    if (result.rows.length == 0) {
        eventos.append('<div class="row">' +
                  '<div class="col s12 m12">' +
                    '<div class="card">' +
                      '<div class="card-content no_eventos">' +
                          '<i class="mdi-alert-warning"></i> No events this week.' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>');        
    } else {
        if (result.rows.item(0).categoria.length > 15) { //nombre de categoria largo o corto
            get_category_nav(result.rows.item(0).categoria_short);
        } else {
            get_category_nav(result.rows.item(0).categoria);
        }
        for (var i = 0; i < result.rows.length; i++) {
            var distancia; var circuito; var nro_fecha; var destacado; var tipo_icono;
            var row = result.rows.item(i);
            //buscamos la distancia siempre que el circuito no sea el "240"
                if (row.id_circuito != "240") {
                    var lat = window.localStorage.getItem("rc2016_lat");
                    var lon = window.localStorage.getItem("rc2016_lon");
                    var p1 = LatLon(Geo.parseDMS(lat), Geo.parseDMS(lon));
                    var p2 = LatLon(Geo.parseDMS(row.latitud), Geo.parseDMS(row.longitud));
                    distancia = Math.ceil(p1.distanceTo(p2));
                    circuito = row.circuito + ". ";
                }
                else {
                    distancia = "";
                    circuito = "-";
                }
                //destacados
                if (row.destacado == "1") {
                    destacado = '<i class="material-icons right">&#xE8D0;</i>';
                }
                else {
                     destacado = '';
                }
                //comparamos las fechas
                var fecha_carrera = new Date(row.fecha);
                
                if (hoy.getTime() > fecha_carrera.getTime()) {
                   tipo_icono = '<i class="material-icons small">&#xE86C;</i>';
                }  else {
                     ++siguiente_carrera;
                    if (i == 0 || siguiente_carrera == 1) { //si empieza el torneo marcamos la 1era carrera
                        tipo_icono = '<i class="material-icons small">&#xE39E;</i>';
                    } else {
                        tipo_icono = '<i class="material-icons small">&#xE836;</i>';
                    }
                }
                //contenido body
                eventos.append('<div class="row valign-wrapper borde">'+
                        '<div class="col s2 icono">' +
                            tipo_icono +
                        '</div>' +
                        '<div class="col s9">' +
                            '<div class="lista_heading">'+row.carrera+'</div>' +
                            '<div class="lista_secundario">'+monthNames[parseInt(row.mes)] +', '+ row.dia +'. Round '+ row.nro_carrera +'.</div>' +
                            '<div class="lista_secundario">'+circuito+' '+distancia+' kms.</div>' +
                        '</div>' +
                        '<div class="col s1">' +
                            destacado +
                        '</div>' +
                    '</div>');
        } //for
    }//else        
}

function get_category_nav(categoria){
    $("#category_text").html('<span style="font-weight:200;">category / </span>' + categoria); 
}

$("#nav_listado").click(function(event) {
    console.log("volver");
    $("#nav_listado").hide();
    $("#nav_eventos").show();
    mostrar_contenido();
});


