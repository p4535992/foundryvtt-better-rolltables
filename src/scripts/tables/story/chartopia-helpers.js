import Logger from "../../lib/Logger";

export class BRTChartopiaHelpers {
  static populateLocalRolltableFromChartopiaResults(chartopiaId, options) {}

  static rollRemoteRolltableFromChartopia(chartopiaId, options) {
    const API_ROOT = "https://chartopia.d12dev.com";
    const mult = options.multiple;

    Logger.info("Chartopia | loading...", true);

    fetch(`${API_ROOT}/api/charts/${chartopiaId}/roll/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ mult: mult }),
    })
      .then((response) => {
        if (response.status == 403) {
          Logger.error("Chartopia | Chart is inaccessible", true);
        } else if (response.status == 404) {
          Logger.error("Chartopia | Chart does not exist", true);
        } else if (response.status == 429) {
          result = "Chartopia | Too many rolls in a short space of time.";
        } else if (response.status == 201) {
          var resultStr = "";
          response.json().then((data) => {
            Logger.info("Chartopia | results:", false, data.results);
            data.results.forEach(function (result) {
              // TODO REMEBER TO IMPORT THELIBRARY
              // var resultAsMarkdown = marked.parse(result, { gfm: true, breaks: true });
              let resultAsMarkdown = result;
              // Success!
              let whisper = !!gmOnly ? game.users.filter((u) => u.isGM).map((u) => u.data._id) : Array.from("");
              let chatData = {
                user: game.userId,
                speaker: ChatMessage.getSpeaker(),
                content: resultAsMarkdown,
                whisper,
              };
              ChatMessage.create(chatData, {});
              resultStr += `<div>${resultAsMarkdown}</div>`;
            });
            Logger.info("Chartopia | Loaded", false, resultStr);
          });
        } else {
          Logger.error(`Chartopia | Unexpected status code: ${response.status}`, true);
        }
      })
      .catch((data) => {
        Logger.error("Chartopia | Unknown error.", true, data);
      });
  }
}
