<?php

    include("../conexion.php");
    $con=conexion();

    mysqli_set_charset($con,"utf8");
    header('Content-Type: application/json');
    ini_set( "display_errors", 0); 
    header('Access-Control-Allow-Origin: *'); 


    if (isset($_GET["get"])) {
        $sQuery = "SELECT count(*) AS total , estado
                   FROM usuario_ticket 
                   GROUP BY estado";
        $qTemp = mysqli_query($con,$sQuery);
        while($rTemp = mysqli_fetch_object($qTemp)) {
            if ( $rTemp->estado == 0 ) {
                $obj->abiertos = intval($rTemp->total);   
            }
            if ( $rTemp->estado == 1 ) {
                $obj->cerrados =  intval($rTemp->total);   
            }
        }

        $sQuery = "SELECT ((sum(nivel_satisfaccion) / count(*) * 100 ) / 5) AS total 
                   FROM calificacion_ticket";
        $qTemp = mysqli_query($con,$sQuery);
        $rTemp = mysqli_fetch_object($qTemp);
        $obj->satisfaccion = number_format(floatval($rTemp->total), 2, ".", ".");
        print(json_encode($obj));
    }

    if (isset($_GET["grafica"])) {
        $intStado = isset($_GET["estado"]) ? intval($_GET["estado"]) : 0;
        $where = ($intStado != 2) ? "WHERE a.estado = {$intStado} " : ' ';
        $sQuery = "SELECT count(*) AS tickers ,
                          IF (a.id_tecnico IS NULL , 'Sin Asignar' , b.username ) AS usuario ,        
                          (((sum(c.nivel_satisfaccion) / count(*)) * 100) / 5) as porcentaje ,
                          a.id_tecnico AS tecnico ,
                          a.estado 
                    FROM usuario_ticket a 
                    LEFT JOIN calificacion_ticket c on a.id_calificacion = c.id_calificacion 
                    LEFT JOIN usuario b ON a.id_tecnico = b.id_usuario 
                    {$where}
                    GROUP BY b.id_usuario";
                  
        $qTemp = mysqli_query($con , $sQuery);

        $index = 0;
        $arr = array();
        while($rTemp = mysqli_fetch_array($qTemp)) {
            $arr[$index]["tickers"] = $rTemp["tickers"];
            $arr[$index]["estado"] = $rTemp["estado"];
            $arr[$index]["usuario"] = $rTemp["usuario"];
            $arr[$index]["porcentaje"] =  number_format(floatval($rTemp["porcentaje"]), 2, ".", ".");            
            $arr[$index]["tecnico"] =  $rTemp["tecnico"];
            $index ++;   
        }
        print(json_encode($arr));
    }

    if (isset($_GET["detalle"])) {
        $intTecnico = isset($_POST["tecnico"]) ? intval($_POST["tecnico"]) : null;
        $estado = isset($_POST["estado"]) ? intval($_POST["estado"]) : null;
        $select = isset($_POST["select"]) ? intval($_POST["select"]) : null;

        $where = (empty($intTecnico)) ? " WHERE a.id_tecnico IS NULL " : " WHERE a.id_tecnico = {$intTecnico} ";
        $and = ($select == 2) ? " " : "AND a.estado = {$estado}";
        
        $sQuery = "SELECT IF (a.estado = 0 , 'Abierto' , 'Cerrado') AS estado  , a.creacion as fecha , a.id_usuario_ticket ,
                          b.id_ticket , b.nombre_ticket as ticket , 
                          c.nombre_completo as usuario , 
                          e.departamento 
                   FROM usuario_ticket a 
                   INNER JOIN ticket b ON a.id_ticket = b.id_ticket
                   INNER JOIN usuario c ON a.id_usuario = c.id_usuario
                   INNER JOIN departamento_puesto d ON a.id_usuario = d.id_usuario 
                   INNER JOIN departamento e ON d.id_departamento = e.id_departamento
                   {$where}
                   {$and}
                   GROUP BY a.id_usuario_ticket
                   ORDER BY a.creacion DESC";
         
         $qTemp = mysqli_query($con , $sQuery);

         $index = 0;
         $arr = array();
         while($rTemp = mysqli_fetch_array($qTemp)) {
            $arr[$index]["estado"] = $rTemp["estado"];
            $arr[$index]["fecha"] = $rTemp["fecha"];
            $arr[$index]["id_usuario_ticket"] = $rTemp["id_usuario_ticket"];
            $arr[$index]["id_ticket"] = $rTemp["id_ticket"];
            $arr[$index]["ticket"] = $rTemp["ticket"];
            $arr[$index]["usuario"] = $rTemp["usuario"];
            $arr[$index]["departamento"] = $rTemp["departamento"];
            $index ++;   
         }
         print(json_encode($arr));
    }
?>