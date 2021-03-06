function SuggestionTab(button, content) {
    'use strict';
    const suggestionTab = new Tab(button, content);

    suggestionTab.loadTabData = () => {
        let onSuggestionLoad =  (response) => {
            const suggestionContent = suggestionTab.content.find('#suggestion-content');
            if (response.suggestion.length > 0) {
                suggestionContent[0].innerHTML = response.suggestion.map(renderSuggestion).join('\n');
            } else {
                suggestionContent[0].innerHTML = '<div>No suggestions so far</div>'
            }
            suggestionContent.find('.go-to-item').click((e) => {
                const location = JSON.parse(e.target.dataset.location);
                suggestionTab.tabHolder.openLocation(location);
            })
        };

        let renderSuggestion = (suggestion) => {
            return (
                `<div class="suggestion-item">
                    <div class="desctiption suggestion-message">
                        ${suggestion.description}
                    </div>
                    <button 
                        class="go-to-item suggestion-button" 
                        data-location='${JSON.stringify(suggestion.location)}'>
                            Go to item
                    </button>
                </div>`
            )
        };


        let onSuggestionLoadError = () => {
            alert("Can not load statistic for select course");
        };

        $.ajax({
            traditional: true,
            type: 'POST',
            url: 'api/suggestion/',  // TODO remove hardcore
            success: onSuggestionLoad,
            error: onSuggestionLoadError,
            data: {intent: 'get_norm_list'},
            dataType: 'json'
        });
    };

    return suggestionTab;
}
