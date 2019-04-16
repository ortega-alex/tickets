<?php


function estado_categoria($id_categoria, $con){

	//categoria general
	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM categoria WHERE id_categoria=$id_categoria AND estado=0");
	 $row = mysqli_fetch_assoc($exe);
	 $categoria = $row['NUMBER_ROW'];


	//sub categorias inactivas
	 $exe2b = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM categoria c, sub_categoria sb WHERE sb.id_categoria=c.id_categoria AND c.id_categoria=$id_categoria AND sb.estado=0");
	 $row2b = mysqli_fetch_assoc($exe2b);
	 $sub_categorias_inactivas = $row2b['NUMBER_ROW'];

	//sub categorias activas
	 $exe2 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM categoria c, sub_categoria sb WHERE sb.id_categoria=c.id_categoria AND c.id_categoria=$id_categoria AND sb.estado=1");
	 $row2 = mysqli_fetch_assoc($exe2);
	 $sub_categorias_activas = $row2['NUMBER_ROW'];


	//sin tickets
	 $exe33 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sb, categoria c WHERE t.id_sub_categoria=sb.id_sub_categoria AND sb.id_categoria=c.id_categoria AND c.id_categoria=$id_categoria");
	 $row33 = mysqli_fetch_assoc($exe33);
	 $tickets = $row33['NUMBER_ROW'];


	//estado todas sus sub
	 $exe33 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sb, categoria c WHERE t.id_sub_categoria=sb.id_sub_categoria AND sb.id_categoria=c.id_categoria AND c.id_categoria=$id_categoria");
	 $row33 = mysqli_fetch_assoc($exe33);
	 $tickets = $row33['NUMBER_ROW'];


	$sql66 = mysqli_query($con, "SELECT * FROM sub_categoria sc, categoria c WHERE sc.id_categoria=c.id_categoria AND c.id_categoria=$id_categoria");
	$disparador_activas=false;
	while($v = mysqli_fetch_object($sql66)){

		 $resp=estado_sub_categoria($v->id_sub_categoria, $con);

		 $resp2= json_decode($resp);

		 if($resp2->{'estado'}=='Activo'){
		 	$disparador_activas=true;
		 }

	}



	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	//EVALUAMOS
	 if (intval($categoria)>0) {

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Categoría Desactivada';
	 	$jsondata['directo'] = 'Si';

	 }elseif(intval($sub_categorias_activas)==0 && intval($sub_categorias_inactivas)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sub-Categorías Desactivadas';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($tickets)==0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sin Tickets';
	 	$jsondata['directo'] = 'No';

	 }elseif ($disparador_activas==false) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sub-Categorías Inactivas';
	 	$jsondata['directo'] = 'No';

	 }




	 return json_encode($jsondata);


}




function estado_sub_categoria($id_sub_categoria, $con){

	//categoria general
	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM categoria c, sub_categoria sc WHERE c.id_categoria=sc.id_categoria AND sc.id_sub_categoria=$id_sub_categoria AND c.estado=0");
	 $row = mysqli_fetch_assoc($exe);
	 $categoria = $row['NUMBER_ROW'];


	//sub categoria inactiva
	 $exe2b = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM sub_categoria WHERE id_sub_categoria=$id_sub_categoria AND estado=0");
	 $row2b = mysqli_fetch_assoc($exe2b);
	 $sub_categorias_inactiva = $row2b['NUMBER_ROW'];


	//tickets inactivas
	 $exe33 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sc WHERE t.id_sub_categoria=sc.id_sub_categoria AND sc.id_sub_categoria=$id_sub_categoria AND t.estado=0");
	 $row33 = mysqli_fetch_assoc($exe33);
	 $tickets_inactivas = $row33['NUMBER_ROW'];


	//tickets activas
	 $exe32 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sc WHERE t.id_sub_categoria=sc.id_sub_categoria AND sc.id_sub_categoria=$id_sub_categoria AND t.estado=1");
	 $row32 = mysqli_fetch_assoc($exe32);
	 $tickets_activas = $row32['NUMBER_ROW'];




	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	//EVALUAMOS
	 if(intval($categoria)>0) {

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Categoría Principal Desactivada';
	 	$jsondata['directo'] = 'No';

	 }elseif(intval($sub_categorias_inactiva)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sub-Categoría Desactivada';
	 	$jsondata['directo'] = 'Si';

	 }elseif (intval($tickets_inactivas)>0 && intval($tickets_activas)==0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Tickets Desactivadas';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($tickets_inactivas)==0 && intval($tickets_activas)==0) {
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sin Tickets creadas';
	 	$jsondata['directo'] = 'No';
	 }

	 return json_encode($jsondata);


}




function estado_ticket($id_ticket, $con){

	//categoria general
	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sc, categoria c WHERE c.id_categoria=sc.id_categoria AND sc.id_sub_categoria=t.id_sub_categoria AND t.id_ticket=$id_ticket AND c.estado=0");
	 $row = mysqli_fetch_assoc($exe);
	 $categoria = $row['NUMBER_ROW'];


	//sub categoria
	 $exe2b = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sc WHERE t.id_sub_categoria=sc.id_sub_categoria AND t.id_ticket=$id_ticket AND sc.estado=0");
	 $row2b = mysqli_fetch_assoc($exe2b);
	 $sub_categoria_inactiva = $row2b['NUMBER_ROW'];


	//ticket inactiva
	 $exe33 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket WHERE id_ticket=$id_ticket AND estado=0");
	 $row33 = mysqli_fetch_assoc($exe33);
	 $ticket = $row33['NUMBER_ROW'];



	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	//EVALUAMOS
	 if(intval($categoria)>0) {

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Categoría Principal Desactivada';
	 	$jsondata['directo'] = 'No';

	 }elseif(intval($sub_categoria_inactiva)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sub-Categoría Desactivada';
	 	$jsondata['directo'] = 'Si';

	 }elseif (intval($ticket)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Ticket Desactivada';
	 	$jsondata['directo'] = 'No';

	 }

	 return json_encode($jsondata);


}



function estado_ticket_usuario($id_ticket, $id_cargo, $con){

	//categoria general
	 $exe = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sc, categoria c WHERE c.id_categoria=sc.id_categoria AND sc.id_sub_categoria=t.id_sub_categoria AND t.id_ticket=$id_ticket AND c.estado=0");
	 $row = mysqli_fetch_assoc($exe);
	 $categoria = $row['NUMBER_ROW'];


	//sub categoria
	 $exe2b = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket t, sub_categoria sc WHERE t.id_sub_categoria=sc.id_sub_categoria AND t.id_ticket=$id_ticket AND sc.estado=0");
	 $row2b = mysqli_fetch_assoc($exe2b);
	 $sub_categoria_inactiva = $row2b['NUMBER_ROW'];


	//ticket inactiva
	 $exe33 = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM ticket WHERE id_ticket=$id_ticket AND estado=0");
	 $row33 = mysqli_fetch_assoc($exe33);
	 $ticket = $row33['NUMBER_ROW'];


	//-----

	 //estado de ticket en perfil
	 $exe_p = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM tickets_cargo tc, departamento_puesto dp WHERE dp.id_cargo=tc.id_cargo AND tc.id_cargo=$id_cargo AND  tc.id_ticket=$id_ticket AND tc.estado=0");
	 $row_p = mysqli_fetch_assoc($exe_p);
	 $ticket_perfil = $row_p['NUMBER_ROW'];

	 //estado de asignacion usuario
	 $exe_c = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto WHERE id_cargo=$id_cargo AND estado=0");
	 $row_c = mysqli_fetch_assoc($exe_c);
	 $cargo_usuario = $row_c['NUMBER_ROW'];

	 //estado del puesto
	 $exe_pg = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, puesto p WHERE dp.id_puesto=p.id_puesto AND p.estado=0 AND dp.id_cargo=$id_cargo");
	 $row_pg = mysqli_fetch_assoc($exe_pg);
	 $puesto_usuario = $row_pg['NUMBER_ROW'];

	 //estado del dpto
	 $exe_d = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, departamento d WHERE dp.id_departamento=d.id_departamento AND d.estado=0 AND dp.id_cargo=$id_cargo");
	 $row_d = mysqli_fetch_assoc($exe_d);
	 $departamento_usuario = $row_d['NUMBER_ROW'];


	 //estado del usuario
	 $exe_us = mysqli_query($con, "SELECT COUNT(*) AS NUMBER_ROW FROM departamento_puesto dp, usuario us WHERE dp.id_usuario=us.id_usuario AND us.estado=0 AND dp.id_cargo=$id_cargo");
	 $row_us = mysqli_fetch_assoc($exe_us);
	 $usuario_estado = $row_us['NUMBER_ROW'];





	 $jsondata['estado'] = 'Activo';
	 $jsondata['motivo'] = 'Activo';
	 $jsondata['directo'] = 'Si';

	//EVALUAMOS
	 if(intval($categoria)>0) {

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Categoría Principal Desactivada';
	 	$jsondata['directo'] = 'No';

	 }elseif(intval($sub_categoria_inactiva)>0){

	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Sub-Categoría Desactivada';
	 	$jsondata['directo'] = 'Si';

	 }elseif (intval($ticket)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Ticket Desactivada';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($ticket_perfil)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Ticket Perfil Desactivada';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($cargo_usuario)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Asignación Desactivada';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($puesto_usuario)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Puesto General Desactivado';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($departamento_usuario)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Departamento Desactivado';
	 	$jsondata['directo'] = 'No';

	 }elseif (intval($usuario_estado)>0) {
	 	
	 	$jsondata['estado'] = 'Inactivo';
	 	$jsondata['motivo'] = 'Usuario Desactivado';
	 	$jsondata['directo'] = 'No';

	 }

	 return json_encode($jsondata);


}



function fase_ticket($id_usuario_ticket, $con){

	//categoria general
	 $exe = mysqli_query($con, "SELECT f.fase FROM usuario_ticket_fase utf, fase f WHERE utf.id_fase=f.id_fase AND utf.id_usuario_ticket=$id_usuario_ticket ORDER BY f.orden DESC LIMIT 1");
	 $row = mysqli_fetch_assoc($exe);
	 $fase = $row['fase'];


	 return $fase;


}




?>
