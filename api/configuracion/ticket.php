<?php

include("../conexion.php");
$con=conexion();
include("./estado_tickets.php");

mysqli_set_charset($con,"utf8");
header('Content-Type: application/json');
ini_set( "display_errors", 0); 
header('Access-Control-Allow-Origin: *'); 


if($_GET[accion]=='nueva_categoria'){
	$fecha= date("Y-m-d H:i:s");
	$sql = mysqli_query($con, "INSERT INTO categoria(categoria, estado, creacion) 
														 VALUES('$_POST[nombre_categoria]', '$_POST[estado]', '$fecha')" );

	if($sql){
	  $lastid=mysqli_insert_id($con);
	  echo json_encode($lastid);
	}else{
	  echo json_encode("error");
	}
}



if($_GET[accion]=='get_categorias'){

	$sql = mysqli_query($con, "SELECT * FROM categoria ORDER BY creacion ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_categoria'=>($v->id_categoria),
	'categoria'=>($v->categoria),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),

	'estado_final'=>(estado_categoria($v->id_categoria, $con)),
	
	);

	}

	echo json_encode($results);

}




if($_GET[accion]=='edit'){


	$sql = mysqli_query($con, "UPDATE categoria SET categoria='$_POST[nombre_categoria]', estado='$_POST[estado]' WHERE id_categoria='$_POST[id_categoria]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='nueva_sub_categoria'){

 
	$fecha= date("Y-m-d H:i:s");

	$sql = mysqli_query($con, "INSERT INTO sub_categoria(sub_categoria, id_categoria, estado, creacion) VALUES('$_POST[nombre_categoria]', '$_POST[id_categoria]', '$_POST[estado]', '$fecha')" );

	if($sql){
	  $lastid=mysqli_insert_id($con);
	  echo json_encode($lastid);
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='get_sub_categorias'){

	$sql = mysqli_query($con, "SELECT * FROM sub_categoria WHERE id_categoria='$_POST[id_categoria]' ORDER BY creacion ");


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_sub_categoria'=>($v->id_sub_categoria),
	'sub_categoria'=>($v->sub_categoria),
	'id_categoria'=>($v->id_categoria),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),

	'estado_final'=>(estado_sub_categoria($v->id_sub_categoria, $con)),

	
	);

	}

	echo json_encode($results);

}



if($_GET[accion]=='nueva_ticket'){


	$fecha= date("Y-m-d H:i:s");

	$sql = mysqli_query($con, "INSERT INTO ticket(nombre_ticket, descripcion, id_sub_categoria, tiempo_estimado, prioridad_recomendada, estado, creacion, procedimiento) VALUES('$_POST[titulo_ticket]', '$_POST[descripcion]', '$_POST[sub_categoria]', '$_POST[minutos_estimados]', '$_POST[prioridad]', '$_POST[estado]', '$fecha', '$_POST[procedimiento]')" );

	if($sql){
	  $lastid=mysqli_insert_id($con);
	  echo json_encode($lastid);
	}else{
	  echo json_encode("error");
	}


}



if($_GET[accion]=='get_tickets'){

	$query="SELECT t.id_ticket, t.nombre_ticket, t.descripcion, t.id_sub_categoria, t.tiempo_estimado, t.prioridad_recomendada, 
								 t.estado, t.creacion, t.procedimiento 
					FROM ticket t, categoria c, sub_categoria s 
					WHERE 1 
					AND c.id_categoria='$_POST[id_categoria]' 
					AND c.id_categoria=s.id_categoria 
					AND s.id_sub_categoria=t.id_sub_categoria";

	$subcat=intval($_POST[sub_categoria]);

	if($subcat>0){
		$query=$query." AND s.id_sub_categoria='$_POST[sub_categoria]' ";
	}

	$query=$query." ORDER BY t.creacion ";



	$sql = mysqli_query($con,  $query);


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'id_ticket'=>($v->id_ticket),
	'nombre_ticket'=>($v->nombre_ticket),
	'descripcion'=>($v->descripcion),
	'id_sub_categoria'=>($v->id_sub_categoria),
	'tiempo_estimado'=>($v->tiempo_estimado),
	'prioridad_recomendada'=>($v->prioridad_recomendada),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),
	'procedimiento'=>($v->procedimiento),

	'estado_final'=>(estado_ticket($v->id_ticket, $con)),

	
	);

	}

	echo json_encode($results);

}



if($_GET[accion]=='get_ticket'){



	$sql = mysqli_query($con, "SELECT * FROM ticket WHERE id_ticket='$_POST[id_ticket]' ");


	$row = mysqli_fetch_object($sql);

	$jsondata['id_ticket'] = $row->id_ticket;
	$jsondata['nombre_ticket'] = $row->nombre_ticket;
	$jsondata['descripcion'] = $row->descripcion;
	$jsondata['id_sub_categoria'] = $row->id_sub_categoria;
	$jsondata['tiempo_estimado'] = $row->tiempo_estimado;
	$jsondata['prioridad_recomendada'] = $row->prioridad_recomendada;
	$jsondata['estado'] = $row->estado;
	$jsondata['creacion'] = $row->creacion;
	$jsondata['procedimiento'] = $row->procedimiento;
	$jsondata['sub_categoria'] = (json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM sub_categoria WHERE id_sub_categoria=$row->id_sub_categoria "))) );
	$jsondata['categoria'] =(json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM categoria c, sub_categoria sb WHERE c.id_categoria=sb.id_categoria AND sb.id_sub_categoria=$row->id_sub_categoria "))) );

	$jsondata['estado_final']=(estado_ticket($row->id_ticket, $con));


	echo json_encode($jsondata);

}


if($_GET[accion]=='edit_ticket'){


	$sql = mysqli_query($con, "UPDATE ticket SET nombre_ticket='$_POST[titulo_ticket]', descripcion='$_POST[descripcion]', id_sub_categoria='$_POST[sub_categoria]', tiempo_estimado='$_POST[minutos_estimados]', prioridad_recomendada='$_POST[prioridad]', estado='$_POST[estado]', procedimiento='$_POST[procedimiento]' WHERE id_ticket='$_POST[id_ticket]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='estado'){


	$sql = mysqli_query($con, "UPDATE ticket SET estado='$_POST[estado]' WHERE id_ticket='$_POST[id_ticket]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}



if($_GET[accion]=='estado_cat'){


	$sql = mysqli_query($con, "UPDATE categoria SET estado='$_POST[estado]' WHERE id_categoria='$_POST[id_categoria]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}




if($_GET[accion]=='estado_sub_cat'){


	$sql = mysqli_query($con, "UPDATE sub_categoria SET estado='$_POST[estado]' WHERE id_sub_categoria='$_POST[id_sub_categoria]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='edit_categoria'){


	$sql = mysqli_query($con, "UPDATE categoria SET categoria='$_POST[nombre_categoria]', estado='$_POST[estado]' WHERE id_categoria='$_POST[id_categoria]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}


if($_GET[accion]=='edit_sub_categoria'){


	$sql = mysqli_query($con, "UPDATE sub_categoria SET sub_categoria='$_POST[nombre_categoria]', estado='$_POST[estado]' WHERE id_sub_categoria='$_POST[id_sub_categoria]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}


}




if($_GET[accion]=='get_tickets_all'){

	$query="SELECT c.categoria, c.id_categoria, s.sub_categoria, s.id_sub_categoria, t.id_ticket, t.nombre_ticket, t.descripcion, t.tiempo_estimado, t.prioridad_recomendada, t.estado, t.creacion, t.procedimiento FROM ticket t, categoria c, sub_categoria s WHERE 1 AND c.id_categoria=s.id_categoria AND s.id_sub_categoria=t.id_sub_categoria  ORDER BY c.categoria, s.sub_categoria";


	$sql = mysqli_query($con,  $query);


	//Create an array with the results
	$results=array();
	while($v = mysqli_fetch_object($sql)){
	$results[] = array(
	'categoria'=>($v->categoria),
	'id_categoria'=>($v->id_categoria),
	'sub_categoria'=>($v->sub_categoria),
	'id_sub_categoria'=>($v->id_sub_categoria),
	'id_ticket'=>($v->id_ticket),
	'nombre_ticket'=>($v->nombre_ticket),
	'descripcion'=>($v->descripcion),
	'tiempo_estimado'=>($v->tiempo_estimado),
	'prioridad_recomendada'=>($v->prioridad_recomendada),
	'estado'=>($v->estado),
	'creacion'=>($v->creacion),
	'procedimiento'=>($v->procedimiento),

	'estado_final'=>(estado_ticket($v->id_ticket, $con)),

	
	);

	}

	echo json_encode($results);

}


if($_GET[accion]=='aperturar_ticket'){


	$fecha= date("Y-m-d H:i:s");

	$sql = mysqli_query($con, "INSERT INTO usuario_ticket(id_ticket, id_usuario, id_cargo, nivel_prioridad, creacion, programada, fecha_programada, info_adicional) VALUES('$_POST[id_ticket]', '$_POST[id_usuario]', '$_POST[id_cargo]', '$_POST[nivel_prioridad]', '$fecha', '$_POST[programada]', '$_POST[fecha_programada]', '$_POST[info_adicional]')" );

	if($sql){

	  $lastid=mysqli_insert_id($con);

	  ticket_siguiente_fase($lastid,'',$con);

	  notificar_nueva_ticket($lastid, $_POST[id_cargo], $con);

	  echo json_encode($lastid);

	}else{
	  echo json_encode("error");
	}


}


function notificar_nueva_ticket($id_ticket, $id_cargo, $con){

	$fecha= date("Y-m-d H:i:s");


	$sql = mysqli_query($con, "SELECT dp.id_usuario FROM tickets_soporte ts, departamento_puesto dp, departamento d WHERE ts.id_cargo=dp.id_cargo AND dp.id_departamento=d.id_departamento AND ts.id_ticket=(SELECT id_ticket FROM usuario_ticket WHERE id_usuario_ticket=$id_ticket) AND d.id_departamento=(SELECT d.id_departamento FROM departamento_puesto dp, departamento d WHERE dp.id_departamento=d.id_departamento AND dp.id_cargo=$id_cargo LIMIT 1) ");

	//datos creador
	 $exe = mysqli_query($con, "SELECT us.username, us.email, us.nombre_completo, p.puesto, d.departamento, t.nombre_ticket FROM usuario_ticket ut, usuario us, departamento_puesto dp, puesto p, departamento d, ticket t WHERE ut.id_usuario=us.id_usuario AND us.estado=1 AND ut.id_ticket=t.id_ticket AND us.id_usuario=dp.id_usuario AND dp.id_puesto=p.id_puesto AND dp.id_departamento=d.id_departamento AND dp.id_cargo=$id_cargo GROUP BY ut.id_usuario_ticket LIMIT 1");
	 $row = mysqli_fetch_assoc($exe);
	 $datos["username"] = $row['username'];
	 $datos["email"] = $row['email'];
	 $datos["nombre_completo"] = $row['nombre_completo'];
	 $datos["puesto"] = $row['puesto'];
	 $datos["departamento"] = $row['departamento'];
	 $datos["nombre_ticket"] = $row['nombre_ticket'];

	 $mensaje=$datos["nombre_ticket"]." - Por: ".$datos["nombre_completo"]." del Dpto. de ".$datos["departamento"].".";


	while($v = mysqli_fetch_object($sql)){

		mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) VALUES($v->id_usuario, 'Nueva Ticket en tu Dpto.', '$mensaje', '$fecha', 'ver_ticket_aceptar', '$id_ticket', 1)" );

	}



	$sql_global= mysqli_query($con, "SELECT us.id_usuario, us.nombre_completo FROM tickets_soporte_global tsg, usuario us WHERE tsg.id_usuario=us.id_usuario AND us.estado=1 AND tsg.id_ticket=(SELECT id_ticket FROM usuario_ticket WHERE id_usuario_ticket='$id_ticket') GROUP BY id_usuario ");

	while($r_global = mysqli_fetch_object($sql_global)) {
	    mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) VALUES($r_global->id_usuario, 'Nueva Ticket - Como Soporte Global', '$mensaje', '$fecha', 'ver_ticket_aceptar', '$id_ticket', 1)" );
	}

	//echo json_encode("Ok");


}



if($_GET[accion]=='get_previsualizar_ticket'){

	//fases
	$strQuery = "SELECT a.id_usuario_ticket , a.id_usuario_ticket_fase , a.id_fase , a.estado , a.fecha_inicio , a.fecha_fin,
											a.id_tecnico , a.resultado , a.calificacion_fase ,
											b.fase , b.orden , b.color , b.tiempo_limite ,
											IF ( a.id_tecnico IS NULL , 'Sin Asignar' ,  c.nombre_completo) AS nombre_completo
								FROM usuario_ticket_fase a 
								INNER JOIN fase b ON a.id_fase = b.id_fase 
								LEFT JOIN usuario c ON a.id_tecnico = c.id_usuario  
								WHERE a.id_usuario_ticket = {$_POST[id_usuario_ticket]}
								GROUP BY a.id_usuario_ticket_fase 
								ORDER BY a.fecha_inicio ASC";
	$qTemp = mysqli_query($con, $strQuery);

	$rows_fases = array();
	while($r = mysqli_fetch_object($qTemp)) {
	    $rows_fases[] = array(
				'id_usuario_ticket_fase'=>($r->id_usuario_ticket_fase),
				'id_fase'=>($r->id_fase),
				'estado'=>($r->estado),
				'fecha_inicio'=>($r->fecha_inicio),
				'fecha_fin'=>($r->fecha_fin),
				'id_tecnico'=>($r->id_tecnico),
				'nombre_tecnico'=>($r->nombre_completo),
				'resultado'=>($r->resultado),
				'calificacion_fase'=>($r->calificacion_fase),
				'fase'=>($r->fase),
				'orden'=>($r->orden),
				'tiempo_limite'=>($r->tiempo_limite),
				'color'=>($r->color)
			);
	}
	$fases_tickets= json_encode($rows_fases);

	//mensajes
	$mensajes = mysqli_query($con, "SELECT men.id_mensaje, men.id_usuario, us.nombre_completo, men.mensaje, men.fecha, men.estado FROM usuario_ticket ut, mensaje men, usuario us WHERE ut.id_usuario_ticket=men.id_usuario_ticket AND men.id_usuario=us.id_usuario AND ut.id_usuario_ticket='$_POST[id_usuario_ticket]' ORDER BY men.fecha ASC");
	$rows_mensajes = array();
	while($r = mysqli_fetch_object($mensajes)) {
		$rows_mensajes[] = array(
			'id_mensaje'=>($r->id_mensaje),
			'id_usuario'=>($r->id_usuario),
			'nombre_completo'=>($r->nombre_completo),
			'mensaje'=>($r->mensaje),
			'fecha'=>($r->fecha),
			'estado'=>($r->estado),

		);
	}

	$mensajes_ticket= json_encode($rows_mensajes);
	$sql = mysqli_query($con, "SELECT c.categoria, sb.sub_categoria, t.nombre_ticket, t.procedimiento, t.descripcion, ut.id_usuario_ticket, ut.nivel_prioridad, ut.creacion, ut.programada, ut.fecha_programada, ut.info_adicional, ut.estado, ut.id_calificacion, us.username, us.username, us.nombre_completo, d.departamento, p.puesto FROM categoria c, sub_categoria sb, ticket t, usuario_ticket ut, usuario us, departamento_puesto dp, puesto p, departamento d WHERE c.id_categoria=sb.id_categoria AND sb.id_sub_categoria=t.id_sub_categoria AND t.id_ticket=ut.id_ticket AND ut.id_usuario=us.id_usuario AND us.id_usuario=dp.id_usuario AND dp.id_departamento=d.id_departamento AND dp.id_puesto=p.id_puesto AND ut.id_usuario_ticket='$_POST[id_usuario_ticket]' GROUP BY t.id_ticket LIMIT 1");


	$row = mysqli_fetch_object($sql);

	$jsondata['categoria'] = $row->categoria;
	$jsondata['sub_categoria'] = $row->sub_categoria;
	$jsondata['nombre_ticket'] = $row->nombre_ticket;
	$jsondata['procedimiento'] = $row->procedimiento;
	$jsondata['descripcion'] = $row->descripcion;
	$jsondata['id_usuario_ticket'] = $row->id_usuario_ticket;
	$jsondata['nivel_prioridad'] = $row->nivel_prioridad;
	$jsondata['creacion'] = $row->creacion;
	$jsondata['programada'] = $row->programada;
	$jsondata['fecha_programada'] = $row->fecha_programada;
	$jsondata['info_adicional'] = $row->info_adicional;
	$jsondata['username'] = $row->username;
	$jsondata['nombre_completo'] = $row->nombre_completo;
	$jsondata['departamento'] = $row->departamento;
	$jsondata['puesto'] = $row->puesto;
	$jsondata['estado'] = $row->estado;
	$jsondata['id_calificacion'] = $row->id_calificacion;
	$jsondata['calificacion'] = (json_encode(mysqli_fetch_object(mysqli_query($con, "SELECT * FROM calificacion_ticket WHERE id_calificacion=$row->id_calificacion "))) );
	$jsondata['fases'] = $fases_tickets;
	$jsondata['mensajes'] = $mensajes_ticket;




	echo json_encode($jsondata);

}



if($_GET[accion]=='tomar_ticket'){


	ticket_siguiente_fase($_POST[id_usuario_ticket], $_POST[id_tecnico], $con);


	//borramos peticiones sobre ticket
	mysqli_query($con, "DELETE FROM notificacion WHERE accion_key='$_POST[id_usuario_ticket]' AND accion='ver_ticket_aceptar' " );

	echo json_encode("Ok");

}


function ticket_siguiente_fase($id_usuario_ticket, $id_tecnico, $con){

	 $fecha= date("Y-m-d H:i:s");

	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM usuario_ticket_fase utf WHERE utf.id_usuario_ticket=$id_usuario_ticket");
	 $row = mysqli_fetch_assoc($exe);
	 $fases = $row['NUMBER_ROW'];


	 if(intval($fases)==0) {

	 	mysqli_query($con, "INSERT INTO usuario_ticket_fase(id_usuario_ticket, id_fase, estado, fecha_inicio) VALUES($id_usuario_ticket, (SELECT id_fase FROM fase ORDER BY orden ASC LIMIT 1), 0, '$fecha')" );

	 }else{

	 	$fase_siguiente=intval($fases) + 1;

	 	//total fases
	 	$exeb = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM fase WHERE estado=1");
		$rowb = mysqli_fetch_assoc($exeb);
		$total_fases = $rowb['NUMBER_ROW'];


		//actualizamos ultima insertada
		//total fases
	 	$ultima = mysqli_query($con, "SELECT utf.id_usuario_ticket_fase, utf.id_tecnico FROM usuario_ticket_fase utf WHERE utf.id_usuario_ticket=$id_usuario_ticket ORDER BY utf.fecha_inicio DESC LIMIT 1");
		$rowultima = mysqli_fetch_assoc($ultima);
		$id_usuario_ticket_fase = $rowultima['id_usuario_ticket_fase'];
	 	mysqli_query($con, "UPDATE usuario_ticket_fase SET fecha_fin='$fecha', estado=1 WHERE id_usuario_ticket_fase='$id_usuario_ticket_fase'");

	 	$limitar=$fase_siguiente-1;

		if(intval($fase_siguiente) < intval($total_fases)){


			

					////////////////////////////////////////
					//ultimo técnico o ninguno
				 	$id_ultimo_tecnico = intval($rowultima['id_tecnico']);
				 		//ha pasado a la siguiente fase con el mismo tencico
				 		$exe_t = mysqli_query($con, "SELECT nombre_completo FROM usuario WHERE id_usuario=$id_tecnico");
						$row_t = mysqli_fetch_assoc($exe_t);
						$nombre_tecnico = $row_t['nombre_completo'];
						$mensaje="";

				 	if($id_ultimo_tecnico!=0){

				 		if(intval($id_ultimo_tecnico)==intval($id_tecnico)){

				 			//insertamos fase siguiente
							mysqli_query($con, "INSERT INTO usuario_ticket_fase(id_usuario_ticket, id_fase, estado, fecha_inicio, id_tecnico) VALUES($id_usuario_ticket, (SELECT id_fase FROM fase ORDER BY orden ASC LIMIT $limitar, 1), 0, '$fecha', $id_tecnico)" );

				 			$mensaje="Tu ticket ha cambiado de estado!";

				 		}else{
				 			//ha habido un cambio de técnico
				 			//ha pasado a la siguiente fase con el mismo tencico
					 		$exe_t2 = mysqli_query($con, "SELECT nombre_completo FROM usuario WHERE id_usuario=$id_tecnico");
							$row_t2 = mysqli_fetch_assoc($exe_t2);
							$nombre_tecnico2 = $row_t2['nombre_completo'];
							$mensaje=$nombre_tecnico." no ha podido continuar atendiendo tu ticket, pero ".$nombre_tecnico2." se hará cargo de ella a partir de ahora.";

							//enviamos notificacion
							$mensaje_2=$nombre_tecnico2." ha tomado tu ticket.";
							mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) VALUES('$id_tecnico', 'Ticket Aceptada!', '$mensaje_2', '$fecha', 'ver_ticket_all', '$id_usuario_ticket', 1)" );

				 		}

				 	}else{
				 		
				 		//insertamos fase siguiente
						mysqli_query($con, "INSERT INTO usuario_ticket_fase(id_usuario_ticket, id_fase, estado, fecha_inicio, id_tecnico) VALUES($id_usuario_ticket, (SELECT id_fase FROM fase ORDER BY orden ASC LIMIT $limitar, 1), 0, '$fecha', $id_tecnico)" );


				 		$mensaje=$nombre_tecnico." ha tomado tu ticket, muy pronto le estará dando solución!";
				 	}
				 	////////////////////////////////////////


		}else{
			//damos por finalizada ticket
			mysqli_query($con, "UPDATE usuario_ticket SET estado=1, id_tecnico=$id_tecnico WHERE id_usuario_ticket=$id_usuario_ticket");
			$mensaje="Ticket dada por finalizada.";
		}


		//enviamos notificacion
		mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) VALUES((SELECT id_usuario FROM usuario_ticket WHERE id_usuario_ticket=$id_usuario_ticket), 'Ticket Actualizada!', '$mensaje', '$fecha', 'ver_ticket', '$id_usuario_ticket', 1)" );



	 }


}


function transferir_ticket($id_usuario_ticket, $id_nuevo_tecnico, $con){

	//notificamos lo mismo 
	$mensaje=$nombre_tecnico." ha tomado tu ticket, muy pronto le estará dando solución!";


}





if($_GET[accion]=='puntuar_fase'){

	$sql = mysqli_query($con, "UPDATE usuario_ticket_fase SET calificacion_fase='$_POST[calificacion_fase]' WHERE id_usuario_ticket_fase='$_POST[id_usuario_ticket_fase]'" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}

}


if($_GET[accion]=='put_mensaje'){

	$fecha= date("Y-m-d H:i:s");

	$sql = mysqli_query($con, "INSERT INTO mensaje(id_usuario, id_usuario_ticket, mensaje, fecha, estado) VALUES('$_POST[id_usuario]', '$_POST[id_usuario_ticket]', '$_POST[mensaje]', '$fecha', 0)" );

	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}

}


if($_GET[accion]=='siguiente_fase'){


	ticket_siguiente_fase($_POST[id_usuario_ticket], $_POST[id_usuario], $con);

	echo json_encode("Ok");

}


if($_GET[accion]=='puntuar_ticket'){

	$sql = mysqli_query($con, "INSERT INTO calificacion_ticket(nivel_satisfaccion, tiempo_espera, amabilidad, conocimientos) VALUES('$_POST[nivel_satisfaccion]', '$_POST[tiempo_espera]', '$_POST[amabilidad]', '$_POST[conocimientos]')" );

	if($sql){
	 	
	 	$lastid=mysqli_insert_id($con);

	  	$sqls = mysqli_query($con, "UPDATE usuario_ticket SET id_calificacion='$lastid' WHERE id_usuario_ticket='$_POST[id_usuario_ticket]'" );

		if($sqls){
		  echo json_encode("Ok");
		}else{
		  echo json_encode("error");
		}


	}else{
	  echo json_encode("error");
	}


	
}

if($_GET[accion]=='get_soporte_compatible'){

	$sql = mysqli_query($con, "SELECT dp.id_usuario, us.nombre_completo FROM tickets_soporte ts, departamento_puesto dp, departamento d, usuario us WHERE ts.id_cargo=dp.id_cargo AND dp.id_departamento=d.id_departamento AND dp.id_usuario=us.id_usuario AND us.estado=1 AND ts.id_ticket=(SELECT id_ticket FROM usuario_ticket WHERE id_usuario_ticket='$_POST[id_usuario_ticket]') AND d.id_departamento=(SELECT d.id_departamento FROM usuario_ticket ut, usuario us, departamento_puesto dp WHERE ut.id_usuario=us.id_usuario AND  us.id_usuario=dp.id_usuario AND ut.id_usuario_ticket='$_POST[id_usuario_ticket]' LIMIT 1) GROUP BY id_usuario ");

	$resultado = array();
	while($r = mysqli_fetch_object($sql)) {
	    $resultado[] = array(
	               'id_usuario'=>($r->id_usuario),
	               'nombre_completo'=>($r->nombre_completo),

	              );
	}


	$sql_global= mysqli_query($con, "SELECT us.id_usuario, us.nombre_completo FROM tickets_soporte_global tsg, usuario us WHERE tsg.id_usuario=us.id_usuario AND us.estado=1 AND  tsg.id_ticket=(SELECT id_ticket FROM usuario_ticket WHERE id_usuario_ticket='$_POST[id_usuario_ticket]') GROUP BY id_usuario ");

	while($r_global = mysqli_fetch_object($sql_global)) {
	    $resultado[] = array(
	               'id_usuario'=>($r_global->id_usuario),
	               'nombre_completo'=>($r_global->nombre_completo.' - Soporte Global'),
	              );
	}

	echo json_encode($resultado);

	
}


if($_GET[accion]=='enviar_ticket_transferida'){

	$fecha= date("Y-m-d H:i:s");

	//datos tecnico
	$exe = mysqli_query($con, "SELECT nombre_completo FROM usuario WHERE id_usuario='$_POST[id_tecnico]' ");
 	$row = mysqli_fetch_assoc($exe);
 	$nombre_tecnico = $row['nombre_completo'];

 	$titulo= $nombre_tecnico." te ha transferido una ticket";
 	$mensaje= "Por algún motivo ".$nombre_tecnico." no ha podido continuar con esta ticket, podrías darle continuidad?";

 	//enviamos notificacion
	$sqls = mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) 
															VALUES('$_POST[id_usuario]', '$titulo', '$mensaje', '$fecha', 'ver_ticket_aceptar_transferida', 
																			'$_POST[id_usuario_ticket]', 1)" );

	//provicional
	$strQuery = "UPDATE usuario_ticket AS a
							 INNER JOIN usuario_ticket_fase AS b ON a.id_usuario_ticket = b.id_usuario_ticket
							 SET a.id_tecnico = {$_POST[id_tecnico]} ,
								 b.id_tecnico = {$_POST[id_tecnico]}
							 WHERE a.id_usuario_ticket = {$_POST[id_usuario_ticket]}";
	mysqli_query($con, $strQuery);

	if($sqls){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}	
}

if($_GET[accion]=='no_tomar_ticket'){

	$fecha= date("Y-m-d H:i:s");

	//datos tecnico
	$exe = mysqli_query($con, "SELECT nombre_completo FROM usuario WHERE id_usuario='$_POST[id_tecnico]' ");
 	$row = mysqli_fetch_assoc($exe);
 	$nombre_tecnico = $row['nombre_completo'];

 	$titulo= $nombre_tecnico." ha rechazado tu ticket";
 	$mensaje= "Por algún motivo ".$nombre_tecnico." no ha podido tomar tu ticket.";

 	//enviamos notificacion
	$sql = mysqli_query($con, "INSERT INTO notificacion(id_usuario, titulo, descripcion, creacion, accion, accion_key, estado) VALUES((SELECT utf.id_tecnico FROM usuario_ticket ut, usuario_ticket_fase utf WHERE  ut.id_usuario_ticket=utf.id_usuario_ticket AND ut.id_usuario_ticket='$_POST[id_usuario_ticket]' ORDER BY utf.fecha_inicio DESC LIMIT 1), '$titulo', '$mensaje', '$fecha', 'ver_ticket_all', '$_POST[id_usuario_ticket]', 1)");


	if($sql){
	  echo json_encode("Ok");
	}else{
	  echo json_encode("error");
	}

	
}









mysqli_close($con);





?>
