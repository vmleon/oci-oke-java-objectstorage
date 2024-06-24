package dev.victormartin.oke.backend.backend.controller;

import com.oracle.bmc.model.BmcException;
import dev.victormartin.oke.backend.backend.Response;
import dev.victormartin.oke.backend.backend.service.ObjectStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ObjectStorageController {

    Logger log = LoggerFactory.getLogger(ObjectStorageService.class);

    @Autowired
    private ObjectStorageService objectStorageService;

    @GetMapping("/api/os/ns")
    public Response getNamespace() {
        log.info("GET /api/os/ns -> getNamespace()");
        try {
            String namespaceName = objectStorageService.getNamespaceName();
            log.info("Object Storage Namespace: {}", namespaceName);
            return new Response(namespaceName, "");
        } catch (BmcException e) {
            log.error("BmcException: {}", e.getMessage());
            return new Response("", e.getMessage());
        } catch (Exception e) {
            log.error("Exception: {}", e.getMessage());
            return new Response("", e.getMessage());
        }

    }
}
