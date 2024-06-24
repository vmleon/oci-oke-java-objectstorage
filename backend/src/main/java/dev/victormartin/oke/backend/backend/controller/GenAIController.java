package dev.victormartin.oke.backend.backend.controller;

import com.oracle.bmc.model.BmcException;
import dev.victormartin.oke.backend.backend.Response;
import dev.victormartin.oke.backend.backend.service.GenAiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class GenAIController {
    Logger log = LoggerFactory.getLogger(GenAIController.class);

    @Value("${oci.compartment-ocid}")
    private String compartmentOcid;

    @Autowired
    private GenAiService genAiService;

    @GetMapping("/api/genai/models")
    public Response getModels() {
        log.info("GET /api/genai/models -> getModels()");
        log.info("Compartment OCID: {}", compartmentOcid);
        try {
            List<String> modelsList = genAiService.listModels(compartmentOcid);
            String modelsComaSeparated = modelsList
                    .stream()
                    .collect(Collectors.joining(", "));
            return new Response(modelsComaSeparated, "");
        } catch (BmcException e) {
            log.error("BmcException: {}", e.getMessage());
            return new Response("", e.getMessage());
        } catch (Exception e) {
            log.error("Exception: {}", e.getMessage());
            return new Response("", e.getMessage());
        }
    }
}
