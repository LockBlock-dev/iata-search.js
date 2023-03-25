const axios = require("axios").default;
const cheerio = require("cheerio");

class Client {
    /**
     * The IATA client
     * @example const client = new Client();
     */
    constructor() {
        /**
         * The base URL for IATA website
         * @type {String}
         */
        this.BASE_URL = "https://www.iata.org";

        /**
         * The URL for the search portal
         * @type {String}
         */
        this.SEARCH_PORTAL_URL = `${this.BASE_URL}/en/publications/directories/code-search`;

        /**
         * The base URL for airline codes search
         * @type {String}
         */
        this.AIRLINE_CODES_URL = `${this.BASE_URL}/AirlineCodeSearchBlock/Search`;

        /**
         * The base URL for airport codes search
         * @type {String}
         */
        this.AIRPORT_CODES_URL = `${this.BASE_URL}/AirportCodesSearch/Search`;
    }

    #headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:109.0) Gecko/20100101 Firefox/109.0",
    };

    /**
     * Make request against the API
     * @private
     * @param {Object} [reqOptions] request options
     *
     * @returns {Promise<Object>} promise
     */
    #request(reqOptions = {}) {
        let options = {
            headers: {
                ...this.#headers,
            },
            ...reqOptions,
        };

        return axios(options)
            .then((response) => {
                if (reqOptions.raw) return response;

                return response.data;
            })
            .catch((error) => {
                throw error?.response;
            });
    }

    /**
     * Get additional data required for the search
     * @private
     * @param {string} form which form to parse, either airline or airport
     *
     * @returns {Promise<URLSearchParams>} promise
     */
    async #getAdditionalData(form) {
        form = form[0].toUpperCase() + form.slice(1); // IATA form has 'Airport' and 'Airline'

        const res = await this.#request({
            method: "GET",
            url: this.SEARCH_PORTAL_URL,
            raw: true,
        });

        if (res) {
            const $ = cheerio.load(res.data);

            const data = new URL(
                $(`form#searchForm[data-callback-url*="${form}"]`).attr()["data-callback-url"],
                this.BASE_URL
            );

            return {
                ok: true,
                data: data.searchParams,
            };
        } else {
            return {
                ok: false,
                err: "Invalid response from IATA website!",
            };
        }
    }

    /**
     * Airport codes search.
     * @param {string} search query for the search
     * @example client.airport("JFK")
     * @return {Promise<Object>}
     */
    async airport(search) {
        const url = new URL(this.AIRPORT_CODES_URL);
        const params = new URLSearchParams({
            "airport.search": search,
        });

        const additional = await this.#getAdditionalData("airport");

        if (additional.ok) {
            for (const [key, val] of additional.data.entries()) {
                params.append(key, val);
            }

            const res = await this.#request({
                method: "GET",
                url: url,
                params: params,
            });

            if (res) {
                const $ = cheerio.load(res);

                /* Panel results headers */
                // const headers = $("table.datatable thead > tr")
                //     .children("td")
                //     .map((idx, el) => {
                //         console.log($(el).html());
                //         return `${$(el).text()[0].toUpperCase()}${$(el).text().substring(1)}`;
                //     })
                //     .get();

                /* Custom headers */
                const headers = ["city", "location", "iataCode"];

                const data = $("table.datatable tbody")
                    .children("tr")
                    .map((idx, elem) => {
                        const obj = {};
                        $(elem)
                            .children("td")
                            .map((idx, el) => {
                                // Prevents unwanted fields to be added
                                if (headers[idx]) obj[headers[idx]] = $(el).text().trim();
                            });
                        return obj;
                    })
                    .get();

                return {
                    ok: true,
                    result: data,
                };
            } else {
                return {
                    ok: false,
                    err: "Invalid response from IATA website!",
                };
            }
        } else {
            return {
                ok: false,
                err: "Invalid form data from IATA website!",
            };
        }
    }

    /**
     * Airline codes search.
     * @param {string} search query for the search
     * @example client.airline("KL")
     * @return {Promise<Object>}
     */
    async airline(search) {
        const url = new URL(this.AIRLINE_CODES_URL);
        const params = new URLSearchParams({
            "airline.search": search,
        });

        const additional = await this.#getAdditionalData("airline");

        if (additional.ok) {
            for (const [key, val] of additional.data.entries()) {
                params.append(key, val);
            }

            const res = await this.#request({
                method: "GET",
                url: url,
                params: params,
            });

            if (res) {
                const $ = cheerio.load(res);

                /* Panel results headers */
                // const headers = $("table.datatable thead > tr")
                //     .children("td")
                //     .map((idx, el) => {
                //         console.log($(el).html());
                //         return `${$(el).text()[0].toUpperCase()}${$(el).text().substring(1)}`;
                //     })
                //     .get();

                /* Custom headers */
                const headers = ["airline", "country", "iataCode"];

                const data = $("table.datatable tbody")
                    .children("tr")
                    .map((idx, elem) => {
                        const obj = {};
                        $(elem)
                            .children("td")
                            .map((idx, el) => {
                                // Prevents unwanted fields to be added
                                if (headers[idx]) obj[headers[idx]] = $(el).text().trim();
                            });
                        return obj;
                    })
                    .get();

                return {
                    ok: true,
                    result: data,
                };
            } else {
                return {
                    ok: false,
                    err: "Invalid response from IATA website!",
                };
            }
        } else {
            return {
                ok: false,
                err: "Invalid form data from IATA website!",
            };
        }
    }
}

module.exports = { Client };
