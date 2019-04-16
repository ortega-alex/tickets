<?php

include("../conexion.php");
$con=conexion();
include("./estado_puesto.php");

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 



if($_GET[accion]=='get'){

	$sql = mysqli_query($con, "SELECT * FROM puesto ORDER BY puesto ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_puesto'=>($v->id_puesto),
	'puesto'=>($v->puesto),
	'id_perfil_puesto_tickets'=>($v->id_perfil_puesto_tickets),
	'id_perfil_permisos'=>($v->id_perfil_permisos),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),
	'soporte'=>($v->soporte),
	
	'estado_final'=>(estado_puesto($v->id_puesto, $con)),
	);

	}

	echo json_encode($results);

}

if($_GET[accion]=='one'){

	$sql = mysqli_query($con, "SELECT * FROM puesto WHERE id_puesto='$_POST[id_puesto]' ORDER BY puesto ");

	$row = mysqli_fetch_assoc($sql);

	echo json_encode($row);

}


if($_GET[accion]=='nuevo'){


	$fecha= date("Y-m-d H:i:s");

	$sql = mysqli_query($con, "INSERT INTO puesto(puesto, estado, creacion) VALUES('$_POST[nombre_puesto]', '$_POST[estado]', '$fecha')" );

	if($sql){
	  $lastid=mysqli_insert_id($con);
	  echo json_encode($lastid);
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='edit'){


	$sql = mysqli_query($con, "UPDATE puesto SET puesto='$_POST[nombre_puesto]', estado='$_POST[estado]' WHERE id_puesto='$_POST[id_puesto]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}

if($_GET[accion]=='estado'){


	$sql = mysqli_query($con, "UPDATE puesto SET estado='$_POST[estado]' WHERE id_puesto='$_POST[id_puesto]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='guardar_perfil'){

	$exito=True;

	$sql = mysqli_query($con, "DELETE FROM perfil_tickets WHERE id_puesto='$_POST[id_puesto]'" );

	if(!$sql){
		$exito=False;
	}

	$sql = mysqli_query($con, "UPDATE puesto SET limitar_tickets='$_POST[limitar]' WHERE id_puesto='$_POST[id_puesto]'" );

	if(!$sql){
		$exito=False;
	}

	//$json_array  = json_decode($_POST[perfil]);

	$json_array  = json_decode($_POST[perfil], true);
	$elementCount  = count($json_array);
	if($elementCount!=0){

		for($i=0;$i<$elementCount;$i++){

			$sql = mysqli_query($con, "INSERT INTO perfil_tickets(id_ticket, id_puesto) VALUES($json_array[$i], '$_POST[id_puesto]')" );

			if(!$sql){
				$exito=False;
			}

		}

	}



	if($exito){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='get_perfil'){

	$sql = mysqli_query($con, "SELECT * FROM perfil_tickets WHERE id_puesto='$_POST[id_puesto]' ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
		'id_ticket'=>($v->id_ticket),
		'id_puesto'=>($v->id_puesto),
		'estado'=>($v->estado),
	);

	}

	echo json_encode($results);

}





if($_GET[accion]=='actualizar_perfil_usuarios_puesto'){

	$fecha= date("Y-m-d H:i:s");

	$exito=True;



	$sql = mysqli_query($con, "SELECT * FROM departamento_puesto WHERE id_puesto='$_POST[id_puesto]' ");


	while($v = mysqli_fetch_object($sql)){

		$sql_ = mysqli_query($con, "DELETE FROM tickets_cargo WHERE id_cargo='$v->id_cargo' ");

		if(!$sql_){
			$exito=False;
		}


		$sql2 = mysqli_query($con, "SELECT * FROM perfil_tickets WHERE id_puesto='$_POST[id_puesto]' ");
		while($v2 = mysqli_fetch_object($sql2)){

			$sql_2 = mysqli_query($con, "INSERT INTO tickets_cargo(id_cargo, id_ticket, estado, creacion) VALUES('$v->id_cargo', '$v2->id_ticket', 1, '$fecha') ");

			if(!$sql_2){
				$exito=False;
			}

		}


	}

	if($exito){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}




if($_GET[accion]=='guardar_perfil_tickets_soporte'){

	$fecha= date("Y-m-d H:i:s");

	$exito=True;


	$sql_ = "";


	if($_POST[tipo]=='puesto'){
		$sql_ = mysqli_query($con, "DELETE FROM perfil_tickets_soporte WHERE id_puesto='$_POST[id_puesto]' ");
	}

	if($_POST[tipo]=='global'){
		$sql_ = mysqli_query($con, "DELETE FROM perfil_tickets_soporte_global WHERE id_puesto='$_POST[id_puesto]' ");
	}

	if(!$sql_){
		$exito=False;
	}



	$json_array  = json_decode($_POST[perfil], true);
	$elementCount  = count($json_array);
	$sql_2="";
	if($elementCount!=0){

		for($i=0;$i<$elementCount;$i++){
			

			if($_POST[tipo]=='puesto'){
				$sql_2 = mysqli_query($con, "INSERT INTO perfil_tickets_soporte(id_puesto, id_ticket, estado) VALUES('$_POST[id_puesto]', '$json_array[$i]', 1) ");
			}

			if($_POST[tipo]=='global'){
				$sql_2 = mysqli_query($con, "INSERT INTO perfil_tickets_soporte_global(id_puesto, id_ticket, estado) VALUES('$_POST[id_puesto]', '$json_array[$i]', 1) ");
			}


			if(!$sql_2){
				$exito=False;
			}


		}

	}


	if($exito){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}



if($_GET[accion]=='get_tickets_soporte'){

	$sql="";
	$results=array();

	if($_POST[tipo]=='puesto'){

		$sql = mysqli_query($con, "SELECT * FROM perfil_tickets_soporte WHERE id_puesto='$_POST[id_puesto]'");

		while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_ticket'=>($v->id_ticket),
			'id_puesto'=>($v->id_puesto),
			'estado'=>($v->estado),
		);

		}

	}

	if($_POST[tipo]=='global'){

		$sql = mysqli_query($con, "SELECT * FROM perfil_tickets_soporte_global WHERE id_puesto='$_POST[id_puesto]' ");

		while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_ticket'=>($v->id_ticket),
			'id_puesto'=>($v->id_puesto),
			'estado'=>($v->estado),
		);

		}
		
	}


	

	echo json_encode($results);

}



if($_GET[accion]=='actualizar_perfil_soporte_usuarios_puesto'){

	$fecha= date("Y-m-d H:i:s");

	$exito=True;


	if($_POST[tipo]=='puesto'){

		$sql = mysqli_query($con, "SELECT * FROM departamento_puesto WHERE id_puesto='$_POST[id_puesto]' ");


		while($v = mysqli_fetch_object($sql)){

			$sql_ = mysqli_query($con, "DELETE FROM tickets_soporte WHERE id_cargo='$v->id_cargo' ");

			if(!$sql_){
				$exito=False;
			}


			$sql2 = mysqli_query($con, "SELECT * FROM perfil_tickets_soporte WHERE id_puesto='$_POST[id_puesto]' ");
			while($v2 = mysqli_fetch_object($sql2)){

				//$sql = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_OF_ROWS FROM tickets_soporte WHERE id_cargo='$v->id_cargo' AND id_ticket='$v2->id_ticket' ");
				//$row = mysqli_fetch_assoc($sql);
				//$cols_respuesta = $row['NUMBER_OF_ROWS'];
				
				//if($cols_respuesta==0 ){
					$sql_2 = mysqli_query($con, "INSERT INTO tickets_soporte(id_cargo, id_ticket, estado, creacion) VALUES($v->id_cargo, $v2->id_ticket, 1, '$fecha') ");
					if(!$sql_2){
						$exito=False;
					}
				//}


			}


		}

	}


	if($_POST[tipo]=='global'){

		$sql = mysqli_query($con, "SELECT * FROM departamento_puesto WHERE id_puesto='$_POST[id_puesto]' ");


		while($v = mysqli_fetch_object($sql)){

			$sql_ = mysqli_query($con, "DELETE FROM tickets_soporte_global WHERE id_usuario='$v->id_usuario' ");

			if(!$sql_){
				$exito=False;
			}


			$sql2 = mysqli_query($con, "SELECT * FROM perfil_tickets_soporte_global WHERE id_puesto='$_POST[id_puesto]' ");
			while($v2 = mysqli_fetch_object($sql2)){

				$sql_2 = mysqli_query($con, "INSERT INTO tickets_soporte_global(id_usuario, id_ticket, estado, creacion) VALUES('$v->id_usuario', '$v2->id_ticket', 1, '$fecha') ");

				if(!$sql_2){
					$exito=False;
				}

			}


		}

	}


	if($exito){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='cambiar_estado_soporte'){

	$exito=True;


	$sql = mysqli_query($con, "UPDATE puesto SET soporte='$_POST[estado]' WHERE id_puesto='$_POST[id_puesto]'" );

	if(!$sql){
		$exito=False;
	}


	$sql2 = mysqli_query($con, "UPDATE departamento_puesto SET soporte='$_POST[estado]' WHERE id_puesto='$_POST[id_puesto]' ");




	if($sql && $sql2){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}



mysqli_close($con);





?>
