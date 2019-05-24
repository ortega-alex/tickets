<?php

    include("../conexion.php");
    $con=conexion();

    mysqli_set_charset($con,"utf8");
    header('Content-Type: application/json');
    ini_set( "display_errors", 0); 
    header('Access-Control-Allow-Origin: *'); 

    $intUsuario = isset($_POST['_usuario']) ? intval($_POST['_usuario']) : 0;
    $intDepartamento = isset($_POST['id_departamento']) ? intval($_POST['id_departamento']) : 0;
    $dateMes =  isset($_POST['mes']) ?  $_POST['mes'] : time();
    $intStado = isset($_POST["estado"]) ? intval($_POST["estado"]) : 0; 
    $intRol = isset($_POST["rol"]) ? intval($_POST["rol"]) : 0; 
    $intTecnico = isset($_POST["tecnico"]) ? intval($_POST["tecnico"]) : null;
    $intSelect = isset($_POST["select"]) ? intval($_POST["select"]) : null;
    $intTodos = isset($_POST["todos"]) ? intval($_POST["todos"]) : 0;
    
    $fecha = new DateTime(  $_POST['mes']);
    $fecha->modify('first day of this month');
    $fecha_init = $fecha->format('Y-m-d')." 00:00:00";    
    $fecha->modify('last day of this month');
    $fecha_fin = $fecha->format('Y-m-d')." 23:59:59";

    if (isset($_GET["get"])) {

        $strQuery = "SELECT id_rol , soporte
                     FROM usuario 
                     WHERE id_usuario = {$intUsuario}";
        $qTmp = mysqli_query($con , $strQuery);
        $rTmp = mysqli_fetch_assoc($qTmp);
        $puesto = ($rTmp['soporte']) == 0 ? "a.id_usuario" : "a.id_tecnico";
        
        if ($intRol <= 1) {
            $strJOIN = "WHERE a.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}'
                       AND {$puesto} = {$intUsuario}";
        } else {
            $strQuery = "INNER JOIN departamento_puesto b ON a.id_cargo = b.id_cargo
                         AND b.id_departamento IN (SELECT b.id_departamento 
                                                    FROM usuario a
                                                    INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
                                                    WHERE a.id_usuario = {$intUsuario}
                                                    GROUP BY b.id_departamento)";
            $strJOIN = ( $intTodos != 0 ) ? (($intRol == 2) ? $strQuery : "") : 
                        "INNER JOIN departamento_puesto b ON a.id_cargo = b.id_cargo 
                         WHERE a.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}'
                         AND b.id_departamento = {$intDepartamento} ";
        }

        $strQuery = "SELECT count(distinct a.id_usuario_ticket) AS total , a.estado
                     FROM usuario_ticket a
                     {$strJOIN}
                     GROUP BY a.estado";

        $qTmp = mysqli_query($con,$strQuery);
        while($rTmp = mysqli_fetch_object($qTmp)) {
            if ( $rTmp->estado == 0 ) {
                $obj->abiertos = intval($rTmp->total);   
            }
            if ( $rTmp->estado == 1 ) {
                $obj->cerrados =  intval($rTmp->total);   
            }
        }

        $strQuery = "SELECT ((sum(ca.nivel_satisfaccion) / count(a.id_usuario_ticket) * 100 ) / 5) AS total
                     FROM usuario_ticket  a
                     INNER JOIN calificacion_ticket ca ON a.id_calificacion = ca.id_calificacion
                     {$strJOIN}";
        
        $qTmp = mysqli_query($con,$strQuery);
        $rTmp = mysqli_fetch_object($qTmp);
        $obj->satisfaccion = number_format(floatval($rTmp->total), 2, ".", ".");
        print(json_encode($obj));
    }

    if ( isset( $_GET["grafica"] ) ) {        

        $strQuery = "SELECT id_rol , soporte
                     FROM usuario 
                     WHERE id_usuario = {$intUsuario}";
        $qTmp = mysqli_query($con , $strQuery);
        $rTmp = mysqli_fetch_assoc($qTmp);
        $id_rol = $rTmp['id_rol'];
        $andStado = ( $intStado == 2 ) ? 1 : $intStado;  
        $CON = ( $intStado != 2 ) ? "LEFT" : "INNER";  
        
        if ( $intRol > 1 ) {
            $strQuery = "INNER JOIN departamento_puesto d ON a.id_cargo = d.id_cargo
                         WHERE d.id_departamento IN (SELECT b.id_departamento 
                                                    FROM usuario a
                                                    INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
                                                    WHERE a.id_usuario = {$intUsuario}
                                                    GROUP BY b.id_departamento)";
            $_WHERE = ( $intTodos != 0 ) ? (($intRol == 2) ? $strQuery : "WHERE a.estado = {$andStado} ") : 
                    "INNER JOIN departamento_puesto d ON a.id_cargo = d.id_cargo 
                     WHERE a.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}'                                         
                     AND d.id_departamento = {$intDepartamento} ";           
        }  else {
            $puesto = ($rTmp['soporte']) == 0 ? "a.id_usuario" : "a.id_tecnico";   
            $_WHERE = "WHERE a.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}'
                       AND {$puesto} = {$intUsuario} ";
        }              
              
        $strQuery = "SELECT count(*) AS tickers ,
                          IF (a.id_tecnico IS NULL , 'Sin Asignar' , b.username ) AS usuario ,        
                          (((sum(c.nivel_satisfaccion) / count(a.id_usuario_ticket)) * 100) / 5) as porcentaje ,
                          a.id_tecnico AS tecnico ,
                          a.estado 
                    FROM usuario_ticket a 
                    {$CON} JOIN calificacion_ticket c on a.id_calificacion = c.id_calificacion 
                    {$CON} JOIN usuario b ON a.id_tecnico = b.id_usuario                    
                    {$_WHERE}
                    AND a.estado = {$andStado} 
                    GROUP BY b.id_usuario";     

        $qTmp = mysqli_query($con , $strQuery);

        $index = 0;
        $arr = array();
        while($rTmp = mysqli_fetch_array($qTmp)) {
            $arr[$index]["tickers"] = $rTmp["tickers"];
            $arr[$index]["estado"] = $rTmp["estado"];
            $arr[$index]["usuario"] = $rTmp["usuario"];
            $arr[$index]["porcentaje"] =  number_format(floatval($rTmp["porcentaje"]), 2, ".", ".");            
            $arr[$index]["tecnico"] =  $rTmp["tecnico"];
            $index ++;   
        }
        print(json_encode($arr));
    }

    if (isset($_GET["detalle"])) {        

        $strQuery = "SELECT id_rol , soporte
                     FROM usuario 
                     WHERE id_usuario = {$intUsuario}";
        $qTmp = mysqli_query($con , $strQuery);
        $rTmp = mysqli_fetch_assoc($qTmp);     
        
        $andStado = ($intSelect == 2) ? 1 : $intStado;
        $andSatisfaccion = ($intSelect == 2) ? "AND a.id_calificacion IS NOT NULL"  : "";
        
        if ($intRol == 1) {
            $puesto = ($rTmp['soporte']) == 0 ? "a.id_usuario" : "a.id_tecnico";
            $_AND = "AND a.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}'
                     AND {$puesto} = {$intUsuario} ";
        } else {
            $andTecnico = (empty($intTecnico)) ? " IS NULL " : " = {$intTecnico} ";
            $strQuery = "AND a.id_tecnico {$andTecnico}
                         AND d.id_departamento IN ( SELECT b.id_departamento 
                                                    FROM usuario a
                                                    INNER JOIN departamento_puesto b ON a.id_usuario = b.id_usuario
                                                    WHERE a.id_usuario = {$intUsuario}
                                                    GROUP BY b.id_departamento)";
            $_AND = ( $intTodos != 0 ) ? (($intRol == 2) ? $strQuery : "AND a.id_tecnico {$andTecnico}") : 
                        "AND a.creacion BETWEEN '{$fecha_init}' AND '{$fecha_fin}' 
                         AND d.id_departamento = {$intDepartamento} 
                         AND a.id_tecnico {$andTecnico}";
        }

        $strQuery = "SELECT IF (a.estado = 0 , 'Abierto' , 'Cerrado') AS estado  , a.creacion as fecha , a.id_usuario_ticket ,
                          b.id_ticket , b.nombre_ticket as ticket , 
                          c.nombre_completo as usuario , c.id_usuario , 
                          e.departamento 
                   FROM usuario_ticket a 
                   INNER JOIN ticket b ON a.id_ticket = b.id_ticket
                   INNER JOIN usuario c ON a.id_usuario = c.id_usuario
                   INNER JOIN departamento_puesto d ON a.id_cargo = d.id_cargo 
                   INNER JOIN departamento e ON d.id_departamento = e.id_departamento    
                   WHERE a.estado = {$andStado}                              
                   {$_AND}
                   {$andSatisfaccion}
                   GROUP BY a.id_usuario_ticket
                   ORDER BY a.creacion DESC";
              
        $qTmp = mysqli_query($con , $strQuery);
        $index = 0;
        $arr = array();
         while($rTmp = mysqli_fetch_array($qTmp)) {
            $arr[$index]["estado"] = $rTmp["estado"];
            $arr[$index]["fecha"] = $rTmp["fecha"];
            $arr[$index]["id_usuario_ticket"] = $rTmp["id_usuario_ticket"];
            $arr[$index]["id_ticket"] = $rTmp["id_ticket"];
            $arr[$index]["ticket"] = $rTmp["ticket"];
            $arr[$index]["usuario"] = $rTmp["usuario"];
            $arr[$index]["departamento"] = $rTmp["departamento"];
            $arr[$index]["id_usuario"] = $rTmp["id_usuario"];
            $index ++;   
         }
         print(json_encode($arr));
    }

    if ( $_GET['accion'] == 'get_puesto_usuario' ) {
        $strQuery = "SELECT b.id_puesto , b.puesto
                    FROM departamento_puesto a 
                    INNER JOIN puesto b ON a.id_puesto = b.id_puesto
                    WHERE a.id_departamento = {$intDepartamento}";
        $qTmp = mysqli_query($con , $strQuery );
        $arr = array();
        $index = 0;
        while ( $rTmp = mysqli_fetch_array($qTmp) ) {
            $arr[$index]["id_puesto"] = $rTmp['id_puesto'];
            $arr[$index]["puesto"] = $rTmp['puesto'];
            $index++;
        }
        print(json_encode($arr));
    }

    mysqli_close($con);
?>