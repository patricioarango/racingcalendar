//meses
monthNames = [ "","ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
    "JUL", "AGO", "SEP", "OCT", "NOV", "DIC" ];
//funcion sacar 0 de las fechas
function cortar_fecha(fecha){
    if (fecha.substr(0, 1) === "0") {
        return fecha.substr(1, 1);
    }
    else {
        return fecha;
    }
}    
    // Wait for Cordova to load
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    function onDeviceReady() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
    
    // onSuccess Geolocation
    function onSuccess(position) {
        var posicion_inicial = $("#rango_fechas").data("posicion");
        get_autowikipedia_events(position.coords.latitude,position.coords.longitude,posicion_inicial);
        latitud = position.coords.latitude;
        longitud = position.coords.longitude;
    }

    function onError(error) {
        console.log("no tiene habilitado geolocation");
        window.location.href="no_geolocation.html?location=index";
    }
    
    function get_autowikipedia_events(latitud,longitud,posicion) {
        $("#loading_contenedor").show();
        var posicion = posicion;
        console.log("posicion_actual" + posicion);
        var url = "http://autowikipedia.es/phonegap/racing_calendar_eventos.php?next_events=" + posicion;
        $.post(url, { ready: "1"}, function(data) {
            //sacamos loading del body
            $(".loading_contenedor").hide();
            $("#rango_fechas").empty();
            var eventos = $('#eventos').empty();
            console.log(data);
                //header rango fecha
                $("#rango_fechas").append('<a href="#" class="brand-logo"><i class="mdi-hardware-keyboard-arrow-left left anterior_se"></i><span class="ultra-bold">' + monthNames[cortar_fecha(data[0].desde.substr(4, 2))] + '</span><span>' + cortar_fecha(data[0].desde.substr(6, 2)) + ' / <span class="ultra-bold">' + monthNames[cortar_fecha(data[0].hasta.substr(4, 2))] + '</span><span>' + cortar_fecha(data[0].hasta.substr(6, 2))  + '<i class="mdi-hardware-keyboard-arrow-right right siguiente_se"></i></a>' );
            if (data[0].resultados == 0) {
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
                var distancia;
                var circuito;
                var nro_fecha;
                var destacado;
                for (var i=0; i<data.length; i++) {
                    //buscamos la foto por categoria
                   if (data[i].imagen == null) {
                        var foto = "images/foto1.jpg";
                   }
                   else {
                        var foto = data[i].imagen;
                   }
                    //buscamos la distancia siempre que el circuito no sea el "240"
                    if (data[i].circuito_id != "240") {
                        var p1 = LatLon(Geo.parseDMS(latitud), Geo.parseDMS(longitud));
                        var p2 = LatLon(Geo.parseDMS(data[i].latitud), Geo.parseDMS(data[i].longitud));
                        distancia = '<i class="mdi-maps-place">' + Math.ceil(p1.distanceTo(p2)) + " </i> kms ";
                        //alert("descomentar esto para commit")
                        //distancia = '<i class="mdi-maps-place">' + "5000" + " </i> kms ";
                        circuito = '<i class="mdi-maps-directions-car"></i> ' + data[i].circuito;
                    }
                    else {
                        distancia = '<i class="mdi-communication-location-off"></i>';
                        circuito = '<i class="mdi-maps-directions-car"></i> - ';
                    }
                    //destacados
                    if (data[i].destacado == "1") {
                         destacado = '<i class="medium mdi-action-stars right"></i>' ;
                    }
                    else {
                         destacado = "";
                    }
                    //con nro fecha
                    if (data[i].nro_fecha > 0 ){
                        nro_fecha = " Round" + data[i].nro_fecha;
                    }
                    else {
                        nro_fecha = "";
                    }
                    //nombre corto para categoria si el nombre es largo
                    if (data[i].categoria.length > 15) {
                        var categoria = data[i].categoria_short;
                    }
                    else {
                        var categoria = data[i].categoria;
                    }
                    var dia = data[i].fecha.substr(0,2);
                    var mes = data[i].fecha.substr(3,2);
        eventos.append('<div class="row">' +
                          '<div class="col s12 m12">' +
                            '<div class="card" data-id_categoria="' + data[i].categoria_id + '">' +
                              '<div class="card-image">' +
                                '<img src="'+ foto + '">' +
                                '<span class="card-title"><strong>' + categoria + ':</strong> ' + data[i].carrera + '</span>' +
                              '</div>' +
                              '<div class="card-content">' +
                                '<div class="col s10">' +
                                  '<p><i class="mdi-action-today"></i><strong> '+monthNames[cortar_fecha(mes)]+cortar_fecha(dia)+'</strong> '+nro_fecha+'</p>' +
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
                } //cierra for
            } //else
        }, "json");
       
    }
$("#rango_fechas").on('click',".anterior_se",function(e) {
    e.preventDefault();
    var posicion_se = $("#rango_fechas").data("posicion") - 1;
    $("#rango_fechas").data("posicion", posicion_se)
    get_autowikipedia_events(latitud,longitud,posicion_se);
});
$("#rango_fechas").on('click',".siguiente_se",function(e) {
    e.preventDefault();
    var posicion_se = $("#rango_fechas").data("posicion") + 1;
    $("#rango_fechas").data("posicion", posicion_se)
    get_autowikipedia_events(latitud,longitud,posicion_se);
});
$("#eventos").on('click',".card",function(e) {
    e.preventDefault();
   window.location.href='listado.html?id_categoria=' + $(this).data("id_categoria");
});
$('.button-collapse').sideNav({menuWidth: 240, activationWidth: 70});