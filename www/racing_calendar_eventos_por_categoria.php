<?php
$dbHost = "awdb2013.db.8921995.hostedresource.com";
$dbUser = "awdb2013";
$dbPass = "GolPower!2011";
$dbName = "awdb2013";

$conn = new mysqli($dbHost, $dbUser, $dbPass , $dbName);
if ($conn->connect_errno) {
    echo "Falló la conexión a MySQL: (" . $conn->connect_errno . ") " . $conn->connect_error;
}
if (isset($_GET["id_categoria"]) && $_GET["id_categoria"] != "0") {
	$id_categoria = $_GET["id_categoria"];
}
elseif ($_GET["id_categoria"] == "0") {
	$id_categoria = 4;
}
$anio_actual = date("Y");
$sql="SELECT c.carrera, c.fecha as fecha2, DATE_FORMAT(c.fecha,'%e') AS dia,DATE_FORMAT(c.fecha,'%c') AS mes, c.destacado, ca.shortname AS categoria_short, ca.categoria AS categoria,ci.latitud,ci.longitud,ci.id as circuito_id,ca.id as categoria_id,c.nro_fecha,ci.nombre as circuito
FROM carreras c
INNER JOIN subcategorias s ON c.id_subcategoria=s.id
INNER JOIN categorias ca ON s.id_categoria=ca.id
INNER JOIN circuitos ci ON c.id_circuito=ci.id
WHERE ca.id=".$id_categoria."
AND s.anio='".$anio_actual."'
ORDER BY c.fecha";
$res = $conn->query($sql);
while ($row = $res->fetch_array()) {
	$result[] = array(
			'carrera' => utf8_encode($row["carrera"]),
			'desde' => utf8_encode($fechas["lunes"]),
			'hasta' => utf8_encode($fechas["domingo"]),
			'nro_fecha' => utf8_encode($row["nro_fecha"]),
			'categoria' => utf8_encode($row["categoria"]),
			'categoria_id' => utf8_encode($row["categoria_id"]),
			'fecha' => utf8_encode($row["fecha2"]),
			'dia' => utf8_encode($row["dia"]),
			'mes' => utf8_encode($row["mes"]),
			'destacado' => utf8_encode($row["destacado"]),
			'latitud' => utf8_encode($row["latitud"]),
			'longitud' => utf8_encode($row["longitud"]),
			'circuito_id' => utf8_encode($row["circuito_id"]),
			'circuito' => utf8_encode($row["circuito"]),
			'categoria_short' => utf8_encode($row["categoria_short"]),
		);
}
echo json_encode($result);
?>
