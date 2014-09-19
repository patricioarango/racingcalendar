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
//array colores
colores = ["","#e74c3c","#9b59b6","#2ecc71","#f39c12","#e67e22","#95a5a6"];    
colores_borde = ["","#c0392b","#8e44ad","#27ae60","#e67e22","#d35400","#f1c40f"];    
    // Wait for Cordova to load
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    function onDeviceReady() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
    
    // onSuccess Geolocation
    function onSuccess(position) {
        get_autowikipedia_events(position.coords.latitude,position.coords.longitude);
    }

    function onError(error) {
        console.log("no tiene habilitado geolocation");
        window.location.href="no_geolocation.html?location=index";
    }
    
    function get_autowikipedia_events(latitud,longitud) {
        
        var id_categoria = getUrlParameter('id_categoria');
        if (id_categoria  == null) {
            id_categoria = 0;
        }
        else {
            id_categoria = id_categoria;
        }
        console.log("id_categoria" + id_categoria);
        var url = "http://autoplay.es/phonegap/racing_calendar_eventos_por_categoria.php?id_categoria=" + id_categoria;
            $.post(url, { ready: "1"}, function(data) {
            //sacamos loading del body
            $("#loading").hide();
            //mostramos el header
            $("header").show();
            //logueamos la data
            console.log(data);
            var eventos = $('#eventos').empty();
            var header = $("#rango_fecha").empty();
            //nombre corto para categoria si el nombre es largo
                if (data[0].categoria.length > 19) {
                    var categoria = data[0].categoria_short;
                }
                else {
                    var categoria = data[0].categoria;
                }
            //tamaños fuentes
                var fuente_principal = ($( window ).width() * 18 ) / 480;
                 var fuente_header = ($( window ).width() * 24 ) / 480;
                var fuente_info = ($( window ).width() * 13 ) / 480;
                var fuente_distancia = ($( window ).width() * 14 ) / 480;
                var fuente_circuito = ($( window ).width() * 15 ) / 480;
                var fuente_fecha = ($( window ).width() * 25 ) / 480;
                var fuente_mes = ($( window ).width() * 25 ) / 480;
            //contenido header
                 header.append('<img style="float: left;margin-left:20px;" class="anterior_se" src="images/back_w.png" height="40px" /><!-- <img style="float: right; margin-right:20px;" class="siguiente_se" src="images/next2_w.png" height="40px" />--><div class="texto23"><span class="ultra-bold" style="font-size:' + fuente_header + 'px;">category/</span><span class="light" style="font-size:' + fuente_header + 'px;">' + categoria + '</span></div>' );
            for (var i=0; i<data.length; i++) {
                //buscamos la distancia siempre que el circuito no sea el "240"
                if (data[i].circuito_id != "240") {
                    var p1 = LatLon(Geo.parseDMS(latitud), Geo.parseDMS(longitud));
                    var p2 = LatLon(Geo.parseDMS(data[i].latitud), Geo.parseDMS(data[i].longitud));
                    var distancia = '<img src="images/location_b.png" height="20px">' + Math.ceil(p1.distanceTo(p2)) + " kms ";
                    var circuito = '<img src="images/circuit-icon_b.png" height="15px">' + data[i].circuito;
                }
                else {
                    var distancia = "";
                    var circuito = "";
                }
                //destacados
                if (data[i].destacado == "1") {
                     var destacado = '<img style="float:right;height:30px;padding-right: 20px;" src="images/star_black.png" />' ;
                }
                else {
                     var destacado = "";     
                }
                //con nro fecha
                if (data[i].nro_fecha > 0 ){
                    var nro_fecha = " <span class='ultra-bold'>ROUND</span>" + data[i].nro_fecha;
                }
                else {
                    var nro_fecha = "";
                }
                var dia = data[i].fecha.substr(0,2);
                var mes = data[i].fecha.substr(3,2);
                
                //altura para cada div
                var altura_listado = ($( window ).width() * 300 ) / 1600;
                
                //contenido body
                eventos.append('<div class="listado" style="height:'+ altura_listado + 'px; "><div class="listado_izq" style="height:'+ ( (altura_listado / 2 ) + 23)+ 'px;margin-top:'+ ( (altura_listado / 2) - 23 ) +'px; "><span class="ultra-bold" style="font-size:' + fuente_mes + 'px;">' + monthNames[cortar_fecha(mes)] + '</span><span class="light" style="font-size:' + fuente_fecha + 'px;">' + cortar_fecha(dia) + '</span></div><div class="listado_der" style="height:'+ altura_listado + 'px; ">'+ destacado + '<div class="principal" style="font-size:' + fuente_principal + 'px;"><span class="ultra-bold">' + data[i].carrera + '</span></div><div class="info" style="font-size:' + fuente_info + 'px;">' + nro_fecha + '</span></div><div class="distancia" style="font-size:' + fuente_distancia + 'px;"> ' + distancia + '</div><div class="distancia distancia_final" style="font-size:' + fuente_circuito + 'px;"> ' + circuito + '</div></div></div>');
            } //cierra for
            //obtenemos color random para layer
            var rnd_color = Math.floor(Math.random() * (6 - 1 + 1)) +1;
            $("header").css("background-color",colores[rnd_color]);
            $("header").css("border-color",colores_borde[rnd_color]);
            $(".listado_izq").css("color",colores[rnd_color]);
            $(".listado_izq").css("border-color",colores[rnd_color]);
            $(".listado_der").css("border-color",colores[rnd_color]);
        }, "json");
       
    }
//funcion para sacar los datos de la url
function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}  
$("header").on('click',".anterior_se",function(e) {
    e.preventDefault();
   window.location.href='index.html';
});
$("header").on('click',".siguiente_se",function(e) {
    e.preventDefault();
   var posicion = getUrlParameter('posicion');
    if (posicion == null)  {
        posicion = 1;
   }
   else {
        posicion = +posicion + 1; 
   }
   window.location.href='index.html?posicion=' + posicion;
});