<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "calendar_events";

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Receber dados do front-end
$request_method = $_SERVER["REQUEST_METHOD"];

switch ($request_method) {
    case 'GET':
        // Buscar eventos
        $sql = "SELECT * FROM events";
        $result = $conn->query($sql);
        $events = [];
        while($row = $result->fetch_assoc()) {
            $events[] = $row;
        }
        echo json_encode($events);
        break;

    case 'POST':
        // Adicionar evento
        $title = $_POST['title'];
        $start = $_POST['start'];
        $time = $_POST['time'];
        $description = $_POST['description'];
        $sql = "INSERT INTO events (title, start, time, description) VALUES ('$title', '$start', '$time', '$description')";
        if ($conn->query($sql) === TRUE) {
            echo "Novo evento criado com sucesso";
        } else {
            echo "Erro: " . $sql . "<br>" . $conn->error;
        }
        break;

    case 'PUT':
        // Atualizar evento
        parse_str(file_get_contents("php://input"), $_PUT);
        $id = $_PUT['id'];
        $title = $_PUT['title'];
        $start = $_PUT['start'];
        $time = $_PUT['time'];
        $description = $_PUT['description'];
        $sql = "UPDATE events SET title='$title', start='$start', time='$time', description='$description' WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo "Evento atualizado com sucesso";
        } else {
            echo "Erro: " . $sql . "<br>" . $conn->error;
        }
        break;

    case 'DELETE':
        // Deletar evento
        parse_str(file_get_contents("php://input"), $_DELETE);
        $id = $_DELETE['id'];
        $sql = "DELETE FROM events WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo "Evento deletado com sucesso";
        } else {
            echo "Erro: " . $sql . "<br>" . $conn->error;
        }
        break;

    default:
        // Método não permitido
        header("HTTP/1.0 405 Method Not Allowed");
        break;
}

$conn->close();
?>
