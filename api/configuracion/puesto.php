<?php

include("../conexion.php");
$con=conexion();
include("./estado_puesto.php");
include("../helper.php");

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 

if($_GET[accion]=='get'){

	$strQuery = "SELECT * FROM puesto ORDER BY puesto";
	$qTMP = mysqli_query($con, $strQuery);

	$results=array();
	while ( $rTMP = mysqli_fetch_object($qTMP) ) {
		$results[] = array(
			'id_puesto'=>($rTMP->id_puesto),
			'puesto'=>($rTMP->puesto),
			'id_perfil_permisos'=>($rTMP->id_perfil_permisos),
			'estado'=>($rTMP->estado),
			'creacion'=>($rTMP->creacion),
			'soporte'=>($rTMP->soporte),			
			'estado_final'=>(estado_puesto($rTMP->id_puesto, $con)),
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
	$strNombre = isset($_POST['nombre_puesto']) ? trim($_POST['nombre_puesto']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$intEstado = intval($_POST['estado']);
	if ( !empty($strNombre) ) {
		$strQuery = "INSERT INTO perfil_permisos (perfil)
					 VALUES ('{$strNombre}')";
		if (mysqli_query($con , $strQuery)) {
			$id_perfil_permisos = mysqli_insert_id($con);
			$strQuery = "INSERT INTO puesto(puesto, estado, id_perfil_permisos) 
						 VALUES('{$strNombre}', '{$intEstado}', {$id_perfil_permisos})";
			if (mysqli_query($con , $strQuery)) {
				$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
				setHistorial($intUsuario , "Nuevo puesto: {$strNombre} , Estado: {$strEstado}" , $con);
				$lastid=mysqli_insert_id($con);
				echo json_encode($lastid);				
			} else {
				echo json_encode("error");
			}
		}else {
			echo json_encode("error");
		}		
	} else{
	  echo json_encode("error");
	}
}


if($_GET[accion]=='edit'){

	$strNombre = isset($_POST['nombre_puesto']) ? trim($_POST['nombre_puesto']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$intEstado = intval($_POST['estado']);
	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;

	if ( $intIdPuesto > 0 ) {
		$strQuery = "UPDATE puesto 
					 SET puesto='{$strNombre}', 
					 	 estado={$intEstado} 
					 WHERE id_puesto={$intIdPuesto}";
		if ( mysqli_query($con, $strQuery ) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización de puesto: {$strNombre} , Estado: {$strEstado}" , $con);
			echo json_encode("Ok");
		} else {			
			echo json_encode("error");
		}
    } else {
		echo json_encode("error");
	}
}

if($_GET[accion]=='estado'){
	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;
	$intEstado = intval($_POST['estado']);
	$strPuesto = isset($_POST['puesto']) ? trim($_POST['puesto']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ( $intIdPuesto > 0 ) {
		$strQuery =  "UPDATE puesto 
					  SET estado={$intEstado} 
					  WHERE id_puesto={$intIdPuesto}";
		if ( mysqli_query($con , $strQuery) ) {
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización del puesto: {$strPuesto} , se a dado de {$strEstado}." , $con);
			echo json_encode("Ok");
		}  else {
			echo json_encode("error");
		}
	} else {
	  echo json_encode("error");
	}
}


if ( $_GET[accion] == 'guardar_perfil' ) {

	$exito=True;
	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;
	$intLimite = intval($_POST['limitar']);
	$json_array  = json_decode($_POST['perfil'], true);
	$elementCount  = count($json_array);
	$strPuesto = isset($_POST['puesto']) ? trim($_POST['puesto']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
	$intActualizar = intval($_POST['actualizar']);

	if ($intIdPuesto > 0) {
		$strQuery = "DELETE FROM perfil_tickets WHERE id_puesto={$intIdPuesto}";
		if ( !mysqli_query($con, $strQuery) ) {
			$exito=False;
		}

		$strQuery = "UPDATE puesto SET limitar_tickets={$intLimite} WHERE id_puesto={$intIdPuesto}";
		if ( !mysqli_query($con, $strQuery) ) {
			$exito=False;
		}

		if ( $elementCount != 0 ) {
			for ( $i = 0; $i < $elementCount; $i++ ) {
				$strQuery = "INSERT INTO perfil_tickets(id_ticket, id_puesto) VALUES({$json_array[$i]} , {$intIdPuesto} )";	
				if ( !mysqli_query($con, $strQuery) ) {
					$exito=False;
				}
			}	
		}

		if ( $intActualizar == 1 ) {
			$strQuery = "DELETE FROM tickets_cargo 
						 WHERE id_cargo IN ( SELECT id_cargo
											FROM departamento_puesto 
											WHERE id_puesto = {$intIdPuesto} )";
			mysqli_query($con , $strQuery);
			$strQuery = "SELECT id_cargo
						 FROM departamento_puesto 
						 WHERE id_puesto = {$intIdPuesto}";
			$qTMP = mysqli_query($con , $strQuery);
			while($rTMP = mysqli_fetch_array($qTMP)) {
				for ( $i = 0; $i < $elementCount; $i++ ) {
					$strQuery = "INSERT INTO tickets_cargo (id_cargo , id_ticket)
								 VALUES ({$rTMP['id_cargo']} , {$json_array[$i]})";
					if ( !mysqli_query($con, $strQuery) ) {
						$exito=False;
					}
				}
			}			
		}
	} else {
		$exito=False;
	}

	if ( $exito ) {
		$strActuralizar = ($intActualizar == 1) ? "a todos los usurios." : "solo a los usuarios por crear.";
		setHistorial($intUsuario , "Actualización de ticket permitidos del puesto: {$strPuesto}, Se aplico {$strActuralizar}" , $con);
	  	echo json_encode("Ok");
	} else {
	  	echo json_encode("error");
	}
}

if($_GET[accion]=='get_perfil'){

	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;
	$strQuery = "SELECT id_ticket , id_puesto , estado  
				 FROM perfil_tickets 
				 WHERE id_puesto = {$intIdPuesto} ";

	$qTMP = mysqli_query($con, $strQuery );
	$results=array();
	while ( $rTMP = mysqli_fetch_object($qTMP) ) {
		$results[] = array(
			'id_ticket'=>($rTMP->id_ticket),
			'id_puesto'=>($rTMP->id_puesto),
			'estado'=>($rTMP->estado),
		);
	}
	echo json_encode($results);
}

if ( $_GET[accion] == 'guardar_perfil_tickets_soporte' ) {
		
	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;
	$arrTickets = isset($_POST['perfil']) ? json_decode($_POST['perfil'], true) : array();
	$strTipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : null;
	$intActualizar = intval($_POST['actualizar']);
	$intUsuario =  isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ($intIdPuesto > 0) {
		$strTabla = ($strTipo == 'puesto') ? "perfil_tickets_soporte" : "perfil_tickets_soporte_global";
		$strQuery = "DELETE FROM {$strTabla} 
					WHERE id_puesto = {$intIdPuesto}";	
		if ( !mysqli_query($con , $strQuery ) ) {
			echo json_encode("error");
			mysqli_close($con);
			exit();
		}

		foreach ($arrTickets as $key => $id_ticket) {
			$strQuery = "INSERT INTO {$strTabla} (id_puesto, id_ticket) 
						VALUES( $intIdPuesto , {$id_ticket} )";
			if ( !mysqli_query($con , $strQuery ) ) {
				echo json_encode("error");
				mysqli_close($con);
				exit();
			}
		}

		if ( $intActualizar == 1 ) {
			$strParam = ($strTipo == 'puesto') ? "id_cargo" : "id_usuario";
			$strTabla = ($strTipo == 'puesto') ? "tickets_soporte" : "tickets_soporte_global";

			$strQuery = "DELETE FROM {$strTabla} 
						WHERE {$strParam} in ( SELECT {$strParam} as param
												FROM departamento_puesto 
												WHERE id_puesto = {$intIdPuesto})";
			$qTMP = mysqli_query($con , $strQuery);

			$strQuery = "SELECT {$strParam} as param
						FROM departamento_puesto 
						WHERE id_puesto = {$intIdPuesto}";
			$qTMP = mysqli_query($con , $strQuery);
			while ( $rTMP = mysqli_fetch_array($qTMP) ) {
				foreach ($arrTickets as $key => $id_ticket) {
					$strQuery = "INSERT INTO {$strTabla} ( {$strParam} , id_ticket )
								VALUES ({$rTMP['param']} , {$id_ticket}) ";
					if ( !mysqli_query($con , $strQuery ) ) {
						echo json_encode("error");
						mysqli_close($con);
						exit();
					}
				}
			}
		}

		$strQuery = "SELECT puesto 
					FROM puesto 
					WHERE id_puesto = {$intIdPuesto}";
		$qTMP = mysqli_query($con , $strQuery);
		$rTMP = mysqli_fetch_array($qTMP);
		$strActuralizar = ($intActualizar == 1) ? "todos los usuarios." : "solo los usuarios por crear.";
		setHistorial($intUsuario , "Actualizacion de permisos de soporte {$strTipo}: {$rTMP['puesto']} , se aplico a {$strActuralizar}" , $con);
		echo json_encode("Ok");	
	} else {
		echo json_encode("error");
	}
}

if ( $_GET[accion] == 'get_tickets_soporte' ) {

	$strTipo = trim($_POST['tipo']);
	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;

	if ( $intIdPuesto > 0 ) {
		$strTabla = ($strTipo =='puesto') ? "perfil_tickets_soporte" : "perfil_tickets_soporte_global";
		$res=array();
		
		$strQuery = "SELECT id_ticket , id_puesto , estado  
					 FROM {$strTabla} WHERE id_puesto = {$intIdPuesto} ";
		$qTMP = mysqli_query($con , $strQuery);
		while ( $rTMP = mysqli_fetch_object($qTMP) ) {
			$res[] = array(
				'id_ticket'=>($rTMP->id_ticket),
				'id_puesto'=>($rTMP->id_puesto),
				'estado'=>($rTMP->estado),
			);
		}
		echo json_encode($res);
	}
}

if($_GET[accion]=='cambiar_estado_soporte'){

	$intIdPuesto = isset($_POST['id_puesto']) ? intval($_POST['id_puesto']) : 0;
	$intEstado = intval($_POST['estado']);
	$strPuesto = isset($_POST['puesto']) ? trim($_POST['puesto']) : null;
	$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;

	if ( $intIdPuesto > 0 ) {	
		$strQuery = "UPDATE puesto a 
					 LEFT JOIN 	departamento_puesto b ON a.id_puesto = b.id_puesto
					 SET a.soporte = {$intEstado} ,
						b.soporte = {$intEstado}
					 WHERE a.id_puesto = {$intIdPuesto}";
		if ( mysqli_query($con , $strQuery) ) {

			$strQuery = "UPDATE usuario 
						 SET soporte = {$intEstado} 
						 WHERE id_usuario IN(SELECT id_usuario 
											FROM departamento_puesto 
											WHERE id_puesto = {$intIdPuesto})";
			mysqli_query($con , $strQuery);
			$strEstado = ($intEstado == 0) ? 'Baja' : 'Alta';
			setHistorial($intUsuario , "Actualización como soporte del puesto : {$strPuesto} , se a dado de {$strEstado}." , $con);
			echo json_encode("Ok");
		} else {
			echo json_encode("error");
		}
	} else {
		echo json_encode("error");
	}
}

	if($_GET[accion]=='get_perfil_permisos'){
		$id_puesto = isset($_GET[id_puesto]) ? intval($_GET[id_puesto]) : 0;
		if ( $id_puesto != 0 ) {
			$activos = array();
			$index3 = 0;	
			$strQuery = "SELECT id_accion 
						 FROM puesto a 
						 INNER JOIN perfil_permiso b ON a.id_perfil_permisos = b.id_perfil_permisos
						 WHERE a.id_puesto = {$id_puesto}
						 AND b.estado = 1";
			
			$qTMP= mysqli_query($con , $strQuery);
			$num = mysqli_num_rows($qTMP);
			if ( $num > 0 ) {
				while ($rTMP = mysqli_fetch_array($qTMP)) {
					$activos[$index3] = $rTMP['id_accion'];
					$index3++;
				}				
			} 

			$strQuery = "SELECT a.id_accion , a.accion ,
								b.id_modulo , b.modulo
						FROM accion a 
						INNER JOIN modulo b ON a.id_modulo = b.id_modulo
						AND a.estado = 1
						AND b.estado = 1
						ORDER BY b.id_modulo";
			$qTpm = mysqli_query($con, $strQuery);
			$arr = array();
			
			$index1 = 0;		
			$index2 = 0;

			$modulo = null;
			while ( $rTmp = mysqli_fetch_array($qTpm)) {
				if ($modulo ==  $rTmp["modulo"]) {
					$index2 ++;
				} else {
					$index1 = ($modulo == null) ? 0 : $index1 + 1;
					$modulo = $rTmp["modulo"]; 
					$index2 = 0;				
				}
				$arr[$index1][$rTmp["modulo"]][$index2]["accion"] = $rTmp["accion"];
				$arr[$index1][$rTmp["modulo"]][$index2]["id_accion"] = $rTmp["id_accion"];
				$arr[$index1][$rTmp["modulo"]][$index2]["id_modulo"] = $rTmp["id_modulo"];			
			}
			$res["err"] = "false";
			$res["perfil_permisos"] = $arr;
			$res["activos"] = $activos;
			print(json_encode($res));
		} else {
			$res["err"] = "true";
			$res["mns"] = "no cuenta con puesto asignado.";
			print(json_encode($res));	
		}
	}

	if ( $_GET[accion] == 'guardar_perfil_permisos' ) {
		
		$id_perfil_permisos = isset($_POST['id_perfil_permisos']) ? intval($_POST['id_perfil_permisos']) : 0;
		$activos = isset($_POST['activos']) ? $_POST['activos'] : 0;
		$actualizar = intval($_POST['actualizar']);
		$strPuesto = isset($_POST['puesto']) ? trim($_POST['puesto']) : null;
		$intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
			
		if ($id_perfil_permisos == 0 && $accion == 0) {
			$res['mns'] = 'no cuenta con perfil asignado o no a seleccionado ningun permiso';
			print(json_encode($res));
		} else {
			$strQuery = "DELETE FROM perfil_permiso 
						 WHERE id_perfil_permisos = {$id_perfil_permisos}";
			mysqli_query($con, $strQuery);

			foreach ( explode("," , $activos) as $key => $id_accion) {
				$strQuery = "INSERT INTO perfil_permiso (id_perfil_permisos , id_accion)
							 VALUES ({$id_perfil_permisos} , {$id_accion} )";
				mysqli_query($con,$strQuery);
			}
			
			if ($actualizar == 1) {
				$strQuery = "DELETE FROM usuario_permisos 
							 WHERE id_perfil_permisos = {$id_perfil_permisos}";
				mysqli_query($con, $strQuery);

				$strQuery = "SELECT c.id_usuario  
							FROM puesto a
							INNER JOIN departamento_puesto b ON a.id_puesto = b.id_puesto
							INNER JOIN usuario c ON b.id_usuario = c.id_usuario
							WHERE a.id_perfil_permisos = {$id_perfil_permisos}";
				$qTMP = mysqli_query($con, $strQuery);
				while($rTMP = mysqli_fetch_array($qTMP)) {
					foreach ( explode("," , $activos) as $key => $id_accion) {
						$strQuery = "INSERT INTO usuario_permisos (id_accion , id_usuario , id_perfil_permisos)
									VALUES ({$id_accion} , {$rTMP['id_usuario']} , {$id_perfil_permisos})";
						mysqli_query($con,$strQuery);
					}
				}
			}			
			$todo = ($actualizar == 1) ? 'a todos los usuarios.' : 'Solo a los nuevos usuarios.';
			setHistorial($intUsuario , "Actualización Perfil Permisos del Puesto : {$strPuesto} , se aplico {$todo}." , $con);
			$res['mns'] = 'Los cambios fueron guardados exitosamente.';
			print(json_encode($res));
		}
	}

	mysqli_close($con);
?>