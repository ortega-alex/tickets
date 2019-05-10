<?php

	include("../conexion.php");
	$con=conexion();

	mysqli_set_charset($con,"utf8");
	header('Content-Type: application/json');
	ini_set( "display_errors", 0); 
	header('Access-Control-Allow-Origin: *'); 

	if($_GET[accion]=='get_notificaciones_usuario'){
		$intNum = isset($_GET['num']) ? intval($_GET['num']) : 10;
		$strQuery = "SELECT * 
					 FROM notificacion 
					 WHERE id_usuario='$_POST[id_usuario]' 
					 ORDER BY creacion DESC
					 LIMIT 10 OFFSET {$intNum}";
		$sql = mysqli_query($con, $strQuery);
		//Create an array with the results
		$results=array();
		while($v = mysqli_fetch_object($sql)){
			$results[] = array(
				'id_notificacion'=>($v->id_notificacion),
				'id_usuario'=>($v->id_usuario),
				'titulo'=>($v->titulo),
				'descripcion'=>($v->descripcion),
				'creacion'=>($v->creacion),
				'data'=>($v->data),
				'accion'=>($v->accion),
				'accion_key'=>($v->accion_key),
				'estado'=>($v->estado),
			);
		}
		echo json_encode($results);
	}

mysqli_close($con);

?>