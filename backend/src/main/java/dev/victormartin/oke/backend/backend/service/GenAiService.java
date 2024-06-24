package dev.victormartin.oke.backend.backend.service;

import com.oracle.bmc.generativeai.GenerativeAiClient;
import com.oracle.bmc.generativeai.model.ModelSummary;
import com.oracle.bmc.generativeai.requests.ListModelsRequest;
import com.oracle.bmc.generativeai.responses.ListModelsResponse;
import dev.victormartin.oke.backend.backend.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GenAiService {
    Logger log = LoggerFactory.getLogger(GenAiService.class);

    @Autowired
    private OciGenAiClientService ociGenAiClientService;

    public List<String> listModels(String compartmentOcid) {
        GenerativeAiClient client = ociGenAiClientService.getClient();
        ListModelsRequest request = ListModelsRequest
                .builder()
                .compartmentId(compartmentOcid)
                .build();
        ListModelsResponse response = client.listModels(request);
        List<ModelSummary> items = response.getModelCollection().getItems();
        List<String> modelsDisplayNames = items.stream()
                .map(i -> i.getDisplayName())
                .collect(Collectors.toList());
        return modelsDisplayNames;
    }
}
