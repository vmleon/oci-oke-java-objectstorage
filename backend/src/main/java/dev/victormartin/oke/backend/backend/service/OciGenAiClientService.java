package dev.victormartin.oke.backend.backend.service;

import com.oracle.bmc.Region;
import com.oracle.bmc.auth.okeworkloadidentity.OkeWorkloadIdentityAuthenticationDetailsProvider;
import com.oracle.bmc.generativeai.GenerativeAiClient;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OciGenAiClientService {
    Logger log = LoggerFactory.getLogger(OciGenAiClientService.class);

    @Value(value = "${oci.region-name}")
    private String regionName;

    private GenerativeAiClient client;

    @PostConstruct
    private void postConstruct() {
        log.info("Region name: {}", regionName);
        final OkeWorkloadIdentityAuthenticationDetailsProvider provider =
                new OkeWorkloadIdentityAuthenticationDetailsProvider
                        .OkeWorkloadIdentityAuthenticationDetailsProviderBuilder()
                        .build();

        client = GenerativeAiClient.builder()
                .region(Region.fromRegionCode(regionName))
                .build(provider);
    }

    public GenerativeAiClient getClient() {
        return client;
    }
}
