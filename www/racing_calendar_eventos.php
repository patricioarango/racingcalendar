<?
$dbHost = "";
$dbUser = "";
$dbPass = "";
$dbName = "";

$conn = new mysqli($dbHost, $dbUser, $dbPass , $dbName);
if ($conn->connect_errno) {
    echo "Falló la conexión a MySQL: (" . $conn->connect_errno . ") " . $conn->connect_error;
}
if (isset($_GET["next_events"])) {
	$nexts = $_GET["next_events"];
}
else {
	$nexts = 0;
}
//calculamos diainicio diafin segun pidan. 0 es esta semana -1 la anterior y 1 la siguiente
function limite_eventos($semanas) {
	if ($semanas < 0) {
		$direccion = "- ";
		$dias_hasta_domingo = ((abs(($semanas +1)) * 7) + date('N'));
		$next_sunday = 0;
	}
	else {
		$direccion = "+ ";
		$dias_hasta_domingo = (7 - date('N'));
		$next_sunday = (abs($semanas) * 7);
	}
	//7 significa domingo
	$domingo_a_buscar = $direccion . ($dias_hasta_domingo + $next_sunday) . " days";
	$diafin = date("Ymd", strtotime($domingo_a_buscar));
	//diainicio
	$diainicio = date("Ymd",strtotime($diafin .' - 6 days'));
	return $dias =  Array(
						"lunes"	=> $diainicio,
						"domingo" => $diafin,
					);
}
//foto random para cada categoria
$dir = "/home/content/95/8921995/html/autowikipedia/phonegap/racing_calendar_pics/";
$folders = scandir($dir);
foreach ($folders as $folder) {
	if (strlen($folder) > 3) {//para sacar las carpetas "."" y "..""
		$files[$folder] = scandir($dir.$folder);
		$files[$folder] = array_diff($files[$folder], array('.', '..'));
	}
}
$fechas = limite_eventos($nexts);
$sql="SELECT c.carrera, DATE_FORMAT(c.fecha,'%d/%m') AS fecha2, c.destacado, ca.shortname AS categoria_short, ca.categoria AS categoria,ci.latitud,ci.longitud,ci.id as circuito_id,ca.id as categoria_id,c.nro_fecha,ci.nombre as circuito
FROM carreras c
INNER JOIN subcategorias s ON c.id_subcategoria=s.id
INNER JOIN categorias ca ON s.id_categoria=ca.id
INNER JOIN circuitos ci ON c.id_circuito=ci.id
WHERE c.fecha BETWEEN ".$fechas["lunes"]." AND ".$fechas["domingo"]."
AND c.mostrar=1
ORDER BY c.fecha";
$res = $conn->query($sql);
$resultados = $res->num_rows;
if ($resultados == 0) {
		$result[] = array(
				'resultados' => utf8_encode($resultados),
				'desde' => utf8_encode($fechas["lunes"]),
				'hasta' => utf8_encode($fechas["domingo"]),
			);
} else {
	while ($row = $res->fetch_array()) {
		$array_fotos = "cat_id_".$row["categoria_id"];
		$foto_nro = array_rand($files[$array_fotos]);
		$dominio_fotos = "http://autowikipedia.es/phonegap/racing_calendar_pics/cat_id_".$row["categoria_id"]."/";
		$result[] = array(
				'resultados' => utf8_encode($resultados),
				'desde' => utf8_encode($fechas["lunes"]),
				'hasta' => utf8_encode($fechas["domingo"]),
				'carrera' => utf8_encode($row["carrera"]),
				'nro_fecha' => utf8_encode($row["nro_fecha"]),
				'categoria' => utf8_encode($row["categoria"]),
				'categoria_id' => utf8_encode($row["categoria_id"]),
				'fecha' => utf8_encode($row["fecha2"]),
				'destacado' => utf8_encode($row["destacado"]),
				'latitud' => utf8_encode($row["latitud"]),
				'longitud' => utf8_encode($row["longitud"]),
				'circuito_id' => utf8_encode($row["circuito_id"]),
				'circuito' => utf8_encode($row["circuito"]),
				'categoria_short' => utf8_encode($row["categoria_short"]),
				'imagen' => $dominio_fotos.$files[$array_fotos][$foto_nro],
			);
	}
}
echo json_encode($result);

?>�U