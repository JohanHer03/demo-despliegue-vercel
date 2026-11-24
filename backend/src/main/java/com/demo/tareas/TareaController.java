package com.demo.tareas;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TareaController {

    /** Cuerpo de POST y PUT. En PUT, los campos null no se tocan. */
    public record TareaRequest(String titulo, Boolean completada) {}

    private final TareaRepository repo;

    public TareaController(TareaRepository repo) {
        this.repo = repo;
    }

    // No toca la BD: sirve para "despertar" el contenedor.
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/tareas")
    public List<Tarea> listar() {
        return repo.findAll(Sort.by("id").ascending());
    }

    @PostMapping("/tareas")
    public ResponseEntity<Tarea> crear(@RequestBody(required = false) TareaRequest body) {
        if (body == null || body.titulo() == null || body.titulo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El título no puede estar vacío");
        }
        Tarea tarea = new Tarea();
        tarea.setTitulo(body.titulo().trim());
        Long id = repo.save(tarea).getId();
        // Se relee para devolver creada_en, que la genera la BD.
        Tarea creada = repo.findById(id).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/tareas/{id}")
    public Tarea actualizar(@PathVariable Long id, @RequestBody TareaRequest body) {
        Tarea tarea = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.titulo() != null) {
            if (body.titulo().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El título no puede estar vacío");
            }
            tarea.setTitulo(body.titulo().trim());
        }
        if (body.completada() != null) {
            tarea.setCompletada(body.completada());
        }
        return repo.save(tarea);
    }

    @DeleteMapping("/tareas/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
