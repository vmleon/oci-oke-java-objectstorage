package dev.victormartin.oke.backend.backend.service;

import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.GetNamespaceRequest;
import com.oracle.bmc.objectstorage.responses.GetNamespaceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ObjectStorageService {

    Logger log = LoggerFactory.getLogger(ObjectStorageService.class);

    @Autowired
    private OciObjectStorageClientService ociObjectStorageClientService;

    public String getNamespaceName() {
        log.info("getNamespaceName()");
        ObjectStorage client = ociObjectStorageClientService.getClient();
        GetNamespaceResponse namespaceResponse =
                client.getNamespace(GetNamespaceRequest.builder().build());
        String namespaceName = namespaceResponse.getValue();
        return namespaceName;
    }
}
