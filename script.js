document.addEventListener('DOMContentLoaded', () => {
    const formularioAdicionarEvento = document.getElementById('addEventForm');
    const listaEventos = document.getElementById('eventos'); // Seleciona a lista de eventos agendados
    const tituloFormulario = document.getElementById('formTitle');
    const botaoEnviar = document.getElementById('submitButton');
    const calendarioEl = document.getElementById('calendar');
    
    let eventos = [];
    let editando = false;
    let eventoAtual = null;

    const calendario = new FullCalendar.Calendar(calendarioEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        events: (info, successCallback, failureCallback) => {
            buscarEventos(successCallback, failureCallback);
        },
        dateClick: function(info) {
            document.getElementById('dataEvento').value = info.dateStr;
        },
        eventClick: function(info) {
            editarEvento(info.event.id);
        }
    });

    calendario.render();

    formularioAdicionarEvento.addEventListener('submit', function(e) {
        e.preventDefault();

        const titulo = document.getElementById('tituloEvento').value;
        const data = document.getElementById('dataEvento').value;
        const hora = document.getElementById('horaEvento').value;
        const descricao = document.getElementById('descricaoEvento').value;

        if (editando) {
            const evento = {
                id: eventoAtual.id,
                title: titulo,
                start: data,
                time: hora,
                description: descricao
            };
            atualizarEvento(evento);
        } else {
            const evento = {
                title: titulo,
                start: data,
                time: hora,
                description: descricao
            };
            criarEvento(evento);
        }

        formularioAdicionarEvento.reset();
        cancelarEdicao();
    });

    function buscarEventos(successCallback, failureCallback) {
        fetch('http://localhost/calendario_eventos/model/events.php')
            .then(response => response.json())
            .then(data => {
                eventos = data;
                successCallback(eventos);

                atualizarListaEventos();
            })
            .catch(error => {
                console.error('Erro ao buscar eventos:', error);
                if (failureCallback) {
                    failureCallback(error);
                }
            });
    }

    function atualizarListaEventos() {
        listaEventos.innerHTML = '';
        eventos.forEach(evento => {
            const li = document.createElement('li');
            li.textContent = `${evento.title} - ${formatarDataHora(evento.start)} ${evento.time}`;
            if (evento.description) {
                li.textContent += ` - ${evento.description}`;
            }

            // Botões de editar e remover
            const botaoEditar = document.createElement('button');
            botaoEditar.textContent = 'Editar';
            botaoEditar.onclick = () => editarEvento(evento.id);
            li.appendChild(botaoEditar);

            const botaoRemover = document.createElement('button');
            botaoRemover.textContent = 'Remover';
            botaoRemover.onclick = () => removerEvento(evento.id);
            li.appendChild(botaoRemover);

            listaEventos.appendChild(li);
        });
    }

    function formatarDataHora(data) {
        if (!data) return '';
        const dataObj = new Date(data);
        return `${dataObj.toLocaleDateString()} ${dataObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    function criarEvento(evento) {
        fetch('http://localhost/calendario_eventos/model/events.php', {
            method: 'POST',
            body: new URLSearchParams(evento)
        })
        .then(response => response.text())
        .then(result => {
            alert(result);
            buscarEventos((eventos) => {
                calendario.removeAllEvents();
                calendario.addEventSource(eventos);
            });
        })
        .catch(error => console.error('Erro:', error));
    }

    function atualizarEvento(evento) {
        fetch('http://localhost/calendario_eventos/model/events.php', {
            method: 'PUT',
            body: new URLSearchParams(evento)
        })
        .then(response => response.text())
        .then(result => {
            alert(result);
            buscarEventos((eventos) => {
                calendario.removeAllEvents();
                calendario.addEventSource(eventos);
            });
        })
        .catch(error => console.error('Erro:', error));
    }

    function removerEvento(id) {
        fetch('http://localhost/calendario_eventos/model/events.php', {
            method: 'DELETE',
            body: new URLSearchParams({ id })
        })
        .then(response => response.text())
        .then(result => {
            alert(result);
            buscarEventos((eventos) => {
                calendario.removeAllEvents();
                calendario.addEventSource(eventos);
            });
        })
        .catch(error => console.error('Erro:', error));
    }

    function editarEvento(id) {
        eventoAtual = eventos.find(evento => evento.id == id);
        document.getElementById('tituloEvento').value = eventoAtual.title;
        document.getElementById('dataEvento').value = eventoAtual.start;
        document.getElementById('horaEvento').value = eventoAtual.time || '';
        document.getElementById('descricaoEvento').value = eventoAtual.description || '';
        tituloFormulario.textContent = 'Editar Evento';
        botaoEnviar.textContent = 'Salvar Alterações';
        editando = true;
    }

    function cancelarEdicao() {
        formularioAdicionarEvento.reset();
        tituloFormulario.textContent = 'Adicionar Novo Evento';
        botaoEnviar.textContent = 'Adicionar Evento';
        editando = false;
        eventoAtual = null;
    }

    buscarEventos((eventos) => {
        calendario.addEventSource(eventos);
    });
});
