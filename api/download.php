<?php
    $path = isset($_GET['ruta']) ? trim($_GET['ruta']) : null; 
    $name = isset($_GET['name']) ? trim($_GET['name']) : null; 
    $mine = mime_content_type("public/{$path}");
    header("Content-Disposition: inline; filename={$name}");
    header("Content-type: application/{$mine}");
    readfile("public/{$path}");
?>