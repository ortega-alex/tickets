<?php

include("../conexion.php");
$con=conexion();
include("./estado_usuario.php");
include("./estado_tickets.php");

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 



if($_GET[accion]=='get'){

	$sql = mysqli_query($con, "SELECT * FROM usuario ORDER BY nombre_completo ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_usuario'=>($v->id_usuario),
	'username'=>($v->username),
	'password'=>($v->password),
	'email'=>($v->email),
	'nombre_completo'=>($v->nombre_completo),
	'estado'=>($v->estado),
	'id_configuracion'=>($v->id_configuracion),
	'creacion'=>($v->creacion),
	);

	}

	echo json_encode($results);

}

if($_GET[accion]=='one'){

	$sql = mysqli_query($con, "SELECT * FROM usuario WHERE id_usuario='$_POST[id_usuario]' ");

	$row = mysqli_fetch_assoc($sql);

	echo json_encode($row);

}



if($_GET[accion]=='get_usuarios_all'){

	//con asignaciones
	$sql = mysqli_query($con, "SELECT us.id_usuario, us.username, us.email, us.nombre_completo, us.estado, us.id_configuracion, us.creacion, us.soporte, d.departamento, p.puesto, count(*) as 'asignaciones'  FROM usuario us, departamento d, departamento_puesto dp,  puesto p WHERE d.id_departamento=dp.id_departamento AND p.id_puesto=dp.id_puesto AND dp.id_usuario=us.id_usuario GROUP BY us.id_usuario ORDER BY us.nombre_completo");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
		$results[] = array(
		'id_usuario'=>($v->id_usuario),
		'username'=>($v->username),
		'email'=>($v->email),
		'nombre_completo'=>($v->nombre_completo),
		'estado'=>($v->estado),
		'id_configuracion'=>($v->id_configuracion),
		'creacion'=>($v->creacion),
		'soporte'=>($v->soporte),
		'departamento'=>($v->departamento),
		'puesto'=>($v->puesto),
		'asignaciones'=>($v->asignaciones),

		'estado_final'=>(estado_usuario($v->id_usuario, $con)),
		
		);

	}


	//sin asignaciones
	$sql2 = mysqli_query($con, "SELECT us.id_usuario, us.username, us.email, us.nombre_completo, us.estado, us.id_configuracion, us.creacion, us.soporte FROM usuario us WHERE us.id_usuario NOT IN(SELECT us.id_usuario  FROM usuario us, departamento d, departamento_puesto dp,  puesto p WHERE d.id_departamento=dp.id_departamento AND p.id_puesto=dp.id_puesto AND dp.id_usuario=us.id_usuario GROUP BY us.id_usuario ORDER BY us.nombre_completo) GROUP BY us.id_usuario ORDER BY us.nombre_completo");

	while($v = mysqli_fetch_object($sql2)){
		$results[] = array(
		'id_usuario'=>($v->id_usuario),
		'username'=>($v->username),
		'email'=>($v->email),
		'nombre_completo'=>($v->nombre_completo),
		'estado'=>($v->estado),
		'id_configuracion'=>($v->id_configuracion),
		'creacion'=>($v->creacion),
		'soporte'=>($v->soporte),
		'departamento'=>('Sin asignar'),
		'puesto'=>('Sin asignar'),
		'asignaciones'=>('0'),

		'estado_final'=>(estado_usuario($v->id_usuario, $con)),
		
		);

	}

	echo json_encode($results);



}


if($_GET[accion]=='edit'){


	$sql = mysqli_query($con, "UPDATE usuario SET username='$_POST[username]', password='$_POST[pass]', email='$_POST[email]', nombre_completo='$_POST[nombre_completo]', estado='$_POST[activo]' WHERE id_usuario='$_POST[id_usuario]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}





if($_GET[accion]=='cambiar_estado'){


	$sql = mysqli_query($con, "UPDATE usuario SET estado='$_POST[estado]' WHERE id_usuario='$_POST[id_usuario]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}

if($_GET[accion]=='cambiar_estado_soporte'){


	$sql = mysqli_query($con, "UPDATE usuario SET soporte='$_POST[estado]' WHERE id_usuario='$_POST[id_usuario]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}



if($_GET[accion]=='nuevo'){


	$sql = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_OF_ROWS FROM usuario WHERE username='$_POST[username]'");
	$row = mysqli_fetch_assoc($sql);
	$cols_respuesta = $row['NUMBER_OF_ROWS'];

	if($cols_respuesta==0 ){


		$fecha= date("Y-m-d H:i:s");

		$sql = mysqli_query($con, "INSERT INTO usuario(username, password, email, nombre_completo, estado, creacion) VALUES('$_POST[username]', '$_POST[pass]', '$_POST[email]', '$_POST[nombre_completo]', '$_POST[activo]', '$fecha')" );

		if($sql){
		  $lastid=mysqli_insert_id($con);
		  echo json_encode($lastid);
		}else{
		  echo json_encode("error");
		}
	}else{
		echo json_encode("existe");
	}


}


if($_GET[accion]=='asignar'){
	$sql = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_OF_ROWS 
							   FROM departamento_puesto 
							   WHERE id_puesto='$_POST[puesto]' 
							   AND id_departamento='$_POST[departamento]' 
							   AND id_usuario='$_POST[usuario]'");
	$row = mysqli_fetch_assoc($sql);
	$cols_respuesta = $row['NUMBER_OF_ROWS'];

	if($cols_respuesta==0 ){


		$fecha= date("Y-m-d H:i:s");

		$exito=True;

		$sql = mysqli_query($con, "INSERT INTO departamento_puesto(id_puesto, id_departamento, id_usuario, estado, creacion) VALUES('$_POST[puesto]', '$_POST[departamento]', '$_POST[usuario]', '$_POST[activo]', '$fecha')" );

		if(!$sql){
		  $exito=False;
		}

		$lastid=mysqli_insert_id($con);


		//////////////////////////////////
		///aplicamos perfil de permisos///

		if(intval($_POST[nuevo_actualizar_permisos])==1) {

			/////perfil tickets puesto
			$sql_ = mysqli_query($con, "SELECT * FROM perfil_tickets WHERE id_puesto='$_POST[puesto]'");
			//Create an array with the results
			$results=array();
			while($v = mysqli_fetch_object($sql_)){

				$sql = mysqli_query($con, "INSERT INTO tickets_cargo(id_cargo, id_ticket, estado, creacion) VALUES('$lastid', '$v->id_ticket', 1, '$fecha')");

				if(!$sql){
					$exito=False;
				}

			}


			/////perfil tickets soporte
			$sql_ = mysqli_query($con, "SELECT * FROM perfil_tickets_soporte WHERE id_puesto='$_POST[puesto]'");
			//Create an array with the results
			$results=array();
			while($v = mysqli_fetch_object($sql_)){

				$sql = mysqli_query($con, "INSERT INTO tickets_soporte(id_cargo, id_ticket, estado, creacion) VALUES('$lastid', '$v->id_ticket', 1, '$fecha')");

				if(!$sql){
					$exito=False;
				}

			}


			/////perfil tickets global
			$sql_ = mysqli_query($con, "SELECT * FROM perfil_tickets_soporte_global WHERE id_puesto='$_POST[puesto]'");
			//Create an array with the results
			$results=array();
			while($v = mysqli_fetch_object($sql_)){

				$sql = mysqli_query($con, "INSERT INTO tickets_soporte_global(id_usuario, id_ticket, estado, creacion) VALUES((SELECT id_usuario FROM departamento_puesto dp, puesto p WHERE p.id_puesto=dp.id_puesto AND p.id_puesto='$_POST[puesto]' LIMIT 1), '$v->id_ticket', 1, '$fecha')");

				if(!$sql){
					$exito=False;
				}

			}




		}



		//////////////////////////////////


		if($exito){
		  echo json_encode($lastid);
		}else{
		  echo json_encode("error");
		}

	}else{
		echo json_encode("existe");
	}


}


if($_GET[accion]=='borrar_asignacion'){


	$sql = mysqli_query($con, "DELETE FROM departamento_puesto WHERE id_cargo='$_POST[id_asignacion]'" );

	if($sql){
	  echo json_encode("ok");
	}else{
	  echo json_encode("error");
	}

}



if($_GET[accion]=='get_asignaciones_one'){

	$sql = mysqli_query($con, "SELECT dp.id_cargo, p.id_puesto, p.puesto, p.limitar_tickets, d.departamento, us.id_usuario, dp.soporte FROM usuario us, departamento_puesto dp, departamento d, puesto p WHERE p.id_puesto=dp.id_puesto AND dp.id_departamento=d.id_departamento AND dp.id_usuario=us.id_usuario AND us.id_usuario='$_POST[id_usuario]' ");

	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_cargo'=>($v->id_cargo),
	'id_puesto'=>($v->id_puesto),
	'puesto'=>($v->puesto),
	'departamento'=>($v->departamento),
	'id_usuario'=>($v->id_usuario),
	'limitar_tickets'=>($v->limitar_tickets),
	'soporte'=>($v->soporte),
	
	);

	}

	echo json_encode($results);

}


if($_GET[accion]=='get_tickets_asignacion'){

	$sql = mysqli_query($con, "SELECT * FROM tickets_cargo WHERE id_cargo='$_POST[id_cargo]'");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
		'id_ticket'=>($v->id_ticket),
		'id_cargo'=>($v->id_cargo),
		'estado'=>($v->estado),
		'creacion'=>($v->creacion),
	);

	}

	echo json_encode($results);

}


if($_GET[accion]=='get_tickets_soporte'){

	$sql="";
	$results=array();

	if($_POST[tipo]=='asignacion'){

		$sql = mysqli_query($con, "SELECT * FROM tickets_soporte WHERE id_cargo='$_POST[id_cargo]'");

		while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_ticket'=>($v->id_ticket),
			'id_cargo'=>($v->id_cargo),
			'estado'=>($v->estado),
			'creacion'=>($v->creacion),
		);

		}

	}

	if($_POST[tipo]=='global'){

		$sql = mysqli_query($con, "SELECT * FROM tickets_soporte_global WHERE id_usuario='$_POST[id_usuario]' ");

		while($v = mysqli_fetch_object($sql)){
		$results[] = array(
			'id_ticket'=>($v->id_ticket),
			'id_usuario'=>($v->id_usuario),
			'estado'=>($v->estado),
			'creacion'=>($v->creacion),
		);

		}
		
	}


	

	echo json_encode($results);

}


if($_GET[accion]=='guardar_perfil_tickets_cargo'){

	$fecha= date("Y-m-d H:i:s");

	$exito=True;


	$sql_ = mysqli_query($con, "DELETE FROM tickets_cargo WHERE id_cargo='$_POST[id_cargo]' ");

	if(!$sql_){
		$exito=False;
	}



	$json_array  = json_decode($_POST[perfil], true);
	$elementCount  = count($json_array);
	if($elementCount!=0){

		for($i=0;$i<$elementCount;$i++){


			$sql_2 = mysqli_query($con, "INSERT INTO tickets_cargo(id_cargo, id_ticket, estado, creacion) VALUES('$_POST[id_cargo]', '$json_array[$i]', 1, '$fecha') ");

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


	if($_POST[tipo]=='asignacion'){
		$sql_ = mysqli_query($con, "DELETE FROM tickets_soporte WHERE id_cargo='$_POST[id_cargo]' ");
	}

	if($_POST[tipo]=='global'){
		$sql_ = mysqli_query($con, "DELETE FROM tickets_soporte_global WHERE id_usuario='$_POST[id_usuario]' ");
	}

	if(!$sql_){
		$exito=False;
	}



	$json_array  = json_decode($_POST[perfil], true);
	$elementCount  = count($json_array);
	$sql_2="";
	if($elementCount!=0){

		for($i=0;$i<$elementCount;$i++){


			

			if($_POST[tipo]=='asignacion'){
				$sql_2 = mysqli_query($con, "INSERT INTO tickets_soporte(id_cargo, id_ticket, estado, creacion) VALUES('$_POST[id_cargo]', '$json_array[$i]', 1, '$fecha') ");
			}

			if($_POST[tipo]=='global'){
				$sql_2 = mysqli_query($con, "INSERT INTO tickets_soporte_global(id_usuario, id_ticket, estado, creacion) VALUES('$_POST[id_usuario]', '$json_array[$i]', 1, '$fecha') ");
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

if($_GET[accion]=='cambiar_estado_soporte_asignacion'){


	$sql = mysqli_query($con, "UPDATE departamento_puesto SET soporte='$_POST[estado]' WHERE id_cargo='$_POST[id_cargo]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}



if($_GET[accion]=='get_tickets_usuario'){


	$sql = mysqli_query($con,  "SELECT tc.id_cargo, tc.id_ticket, tc.estado, tc.creacion, t.nombre_ticket, t.descripcion, t.prioridad_recomendada, p.puesto, d.id_departamento, d.departamento FROM tickets_cargo tc, ticket t, puesto p, departamento_puesto dp, departamento d, usuario us WHERE t.id_ticket=tc.id_ticket AND tc.id_cargo=dp.id_cargo AND dp.id_puesto=p.id_puesto AND dp.id_departamento=d.id_departamento AND dp.id_usuario=us.id_usuario AND us.id_usuario='$_POST[id_usuario]' ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_cargo'=>($v->id_cargo),
	'id_ticket'=>($v->id_ticket),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),
	'nombre_ticket'=>($v->nombre_ticket),
	'prioridad_recomendada'=>($v->prioridad_recomendada),
	'descripcion'=>($v->descripcion),
	'puesto'=>($v->puesto),
	'id_departamento'=>($v->id_departamento),
	'departamento'=>($v->departamento),

	'estado_final'=>(estado_ticket_usuario($v->id_ticket, $v->id_cargo, $con)),

	
	);

	}

	echo json_encode($results);

}



if($_GET[accion]=='get_departamentos_one'){


	$sql = mysqli_query($con,  "SELECT d.departamento, dp.id_departamento FROM departamento_puesto dp, departamento d WHERE dp.id_departamento=d.id_departamento AND dp.id_usuario='$_POST[id_usuario]' GROUP BY dp.id_departamento ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_departamento'=>($v->id_departamento),
	'departamento'=>($v->departamento),
	
	);

	}

	echo json_encode($results);

}



if($_GET[accion]=='get_usuarios_departamento_one'){


	$sql = mysqli_query($con,  "SELECT us.id_usuario, us.nombre_completo FROM departamento_puesto dp, usuario us WHERE dp.id_usuario=us.id_usuario AND dp.id_departamento='$_POST[id_departamento]' AND us.estado=1 GROUP BY us.id_usuario ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_usuario'=>($v->id_usuario),
	'nombre_completo'=>($v->nombre_completo),
	
	);

	}

	echo json_encode($results);

}



if($_GET[accion]=='get_tickets_abiertas_usuario'){


	$sql = mysqli_query($con,  "SELECT ut.id_usuario_ticket, t.id_ticket, t.nombre_ticket, ut.estado, t.descripcion, 
									   ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional, 
									   p.puesto, d.departamento, us.nombre_completo  
							    FROM usuario us, usuario_ticket ut, ticket t, departamento_puesto dp, departamento d, puesto p 
								WHERE t.id_ticket=ut.id_ticket 
								AND ut.id_usuario=us.id_usuario 
								AND us.id_usuario=dp.id_usuario 
								AND dp.id_departamento=d.id_departamento 
								AND dp.id_puesto=p.id_puesto 
								AND (ut.estado=0 OR ut.id_calificacion IS NULL) 
								AND us.id_usuario='$_POST[id_usuario]' 
								GROUP BY ut.id_usuario_ticket");


	 //cantidad fases
	 $exe_p = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM fase WHERE estado=1");
	 $row_p = mysqli_fetch_assoc($exe_p);
	 $cantidad_fases = $row_p['NUMBER_ROW'];


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){

		//cantidad fases ticket
		 $exe_p2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM usuario_ticket_fase where id_usuario_ticket=$v->id_usuario_ticket");
		 $row_p2 = mysqli_fetch_assoc($exe_p2);
		 $cantidad_fases_ticket = $row_p2['NUMBER_ROW'];


	$results[] = array(
	'id_usuario_ticket'=>($v->id_usuario_ticket),
	'id_ticket'=>($v->id_ticket),
	'nombre_ticket'=>($v->nombre_ticket),
	'estado'=>($v->estado),
	'descripcion'=>($v->descripcion),
	'nivel_prioridad'=>($v->nivel_prioridad),
	'creacion'=>($v->creacion),
	'programada'=>($v->programada),
	'fecha_programada'=>($v->fecha_programada),
	'info_adicional'=>($v->info_adicional),
	'puesto'=>($v->puesto),
	'departamento'=>($v->departamento),
	'total_fases'=>($cantidad_fases),
	'total_fases_ticket'=>($cantidad_fases_ticket),
	'nombre_completo'=>($v->nombre_completo),

	'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),

	
	);

	}

	echo json_encode($results);

}


if($_GET[accion]=='get_tickets_cerradas_usuario'){


	$sql = mysqli_query($con,  "SELECT ut.id_usuario_ticket, t.id_ticket, t.nombre_ticket, t.descripcion, ut.estado, ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional, p.puesto, d.departamento, us.nombre_completo  FROM usuario us, usuario_ticket ut, ticket t, departamento_puesto dp, departamento d, puesto p WHERE t.id_ticket=ut.id_ticket AND ut.id_usuario=us.id_usuario AND us.id_usuario=dp.id_usuario AND dp.id_departamento=d.id_departamento AND dp.id_puesto=p.id_puesto AND ut.estado=1 AND us.id_usuario='$_POST[id_usuario]' GROUP BY ut.id_usuario_ticket");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_usuario_ticket'=>($v->id_usuario_ticket),
	'id_ticket'=>($v->id_ticket),
	'nombre_ticket'=>($v->nombre_ticket),
	'estado'=>($v->estado),
	'descripcion'=>($v->descripcion),
	'nivel_prioridad'=>($v->nivel_prioridad),
	'creacion'=>($v->creacion),
	'programada'=>($v->programada),
	'fecha_programada'=>($v->fecha_programada),
	'info_adicional'=>($v->info_adicional),
	'puesto'=>($v->puesto),
	'departamento'=>($v->departamento),
	'nombre_completo'=>($v->nombre_completo),

	'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),

	
	);

	}

	echo json_encode($results);

}



if($_GET[accion]=='get_tickets_abiertas_soporte'){


	


	if(empty($_POST[fecha])){

		//modalidad normal

		$sql = mysqli_query($con,  "SELECT ut.id_usuario_ticket, t.id_ticket, t.nombre_ticket, ut.estado, t.descripcion, ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional, p.puesto, d.departamento, us.nombre_completo  FROM usuario us, usuario_ticket ut, ticket t, departamento_puesto dp, departamento d, puesto p WHERE t.id_ticket=ut.id_ticket AND ut.id_usuario=us.id_usuario AND us.id_usuario=dp.id_usuario AND dp.id_departamento=d.id_departamento AND dp.id_puesto=p.id_puesto AND ut.estado=0 AND ut.id_usuario='$_POST[id_usuario]' GROUP BY ut.id_usuario_ticket");

	}else{

		//modalidad calendario

		$fecha_de= $_POST[fecha].' 00:00:00';
		$fecha_a= $_POST[fecha].' 23:59:59';

		$sql = mysqli_query($con,  "SELECT ut.id_usuario_ticket, t.id_ticket, t.nombre_ticket, ut.estado, t.descripcion, ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional, p.puesto, d.departamento, us.nombre_completo  FROM usuario us, usuario_ticket ut, ticket t, departamento_puesto dp, departamento d, puesto p WHERE t.id_ticket=ut.id_ticket AND ut.id_usuario=us.id_usuario AND us.id_usuario=dp.id_usuario AND dp.id_departamento=d.id_departamento AND dp.id_puesto=p.id_puesto AND ut.id_usuario='$_POST[id_usuario]' AND ut.fecha_programada BETWEEN '$fecha_de' AND '$fecha_a' GROUP BY ut.id_usuario_ticket");

	}

	//cantidad fases
	 $exe_p = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM fase WHERE estado=1");
	 $row_p = mysqli_fetch_assoc($exe_p);
	 $cantidad_fases = $row_p['NUMBER_ROW'];

	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){

		//cantidad fases ticket
		 $exe_p2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM usuario_ticket_fase where id_usuario_ticket=$v->id_usuario_ticket");
		 $row_p2 = mysqli_fetch_assoc($exe_p2);
		 $cantidad_fases_ticket = $row_p2['NUMBER_ROW'];


	$results[] = array(
	'id_usuario_ticket'=>($v->id_usuario_ticket),
	'id_ticket'=>($v->id_ticket),
	'nombre_ticket'=>($v->nombre_ticket),
	'estado'=>($v->estado),
	'descripcion'=>($v->descripcion),
	'nivel_prioridad'=>($v->nivel_prioridad),
	'creacion'=>($v->creacion),
	'programada'=>($v->programada),
	'fecha_programada'=>($v->fecha_programada),
	'info_adicional'=>($v->info_adicional),
	'puesto'=>($v->puesto),
	'departamento'=>($v->departamento),
	'total_fases'=>($cantidad_fases),
	'total_fases_ticket'=>($cantidad_fases_ticket),
	'nombre_completo'=>($v->nombre_completo),

	'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),

	
	);

	}

	echo json_encode($results);

}


if($_GET[accion]=='get_tickets_cerradas_soporte'){


	$sql = mysqli_query($con,  "SELECT ut.id_usuario_ticket, t.id_ticket, t.nombre_ticket, ut.estado, t.descripcion, 
									   ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional, 
									   p.puesto, d.departamento, us.nombre_completo  
								FROM usuario us, usuario_ticket ut, ticket t, departamento_puesto dp, departamento d, puesto p 
								WHERE t.id_ticket=ut.id_ticket AND ut.id_usuario=us.id_usuario 
								AND us.id_usuario=dp.id_usuario AND dp.id_departamento=d.id_departamento 
								AND dp.id_puesto=p.id_puesto AND ut.estado=1 AND ut.id_usuario='$_POST[id_usuario]' 
								GROUP BY ut.id_usuario_ticket");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_usuario_ticket'=>($v->id_usuario_ticket),
	'id_ticket'=>($v->id_ticket),
	'nombre_ticket'=>($v->nombre_ticket),
	'estado'=>($v->estado),
	'descripcion'=>($v->descripcion),
	'nivel_prioridad'=>($v->nivel_prioridad),
	'creacion'=>($v->creacion),
	'programada'=>($v->programada),
	'fecha_programada'=>($v->fecha_programada),
	'info_adicional'=>($v->info_adicional),
	'puesto'=>($v->puesto),
	'departamento'=>($v->departamento),
	'nombre_completo'=>($v->nombre_completo),

	'fase_ticket'=>(fase_ticket($v->id_usuario_ticket, $con)),

	
	);

	}

	echo json_encode($results);

}



mysqli_close($con);





?>
