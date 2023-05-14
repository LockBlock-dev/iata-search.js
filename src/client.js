const axios = require("axios").default;
const cheerio = require("cheerio");

class Client {
    /**
     * The IATA client
     * @example const client = new Client();
     */
    constructor() {
        let _filters;

        (function (e) {
            e.AFRICA_AND_MIDDLE_EAST = "Africa & Middle East";
            e.ASIA_PACIFIC = "Asia Pacific";
            e.CHINA_AND_NORTH_ASIA = "China & North Asia";
            e.EUROPE = "Europe";
            e.THE_AMERICAS = "The Americas";
        })(_filters || (_filters = {}));

        /**
         * The filters for the airline codes search
         *
         * Available filters are:
         * - AFRICA_AND_MIDDLE_EAST
         * - ASIA_PACIFIC
         * - CHINA_AND_NORTH_ASIA
         * - EUROPE
         * - THE_AMERICAS
         * @type {Object}
         */
        this.FILTERS = _filters;
    }

    /**
     * The base URL for IATA website
     * @type {String}
     */
    BASE_URL = "https://www.iata.org";

    /**
     * The URL for the search portal
     * @type {String}
     */
    SEARCH_PORTAL_URL = `${this.BASE_URL}/en/publications/directories/code-search`;

    /**
     * The base URL for airport codes search
     * @type {String}
     */
    AIRPORT_CODES_URL = `${this.BASE_URL}/AirportCodesSearch/Search`;

    /**
     * The base URL for the members portal
     * @type {String}
     */
    MEMBERS_PORTAL_URL = `${this.BASE_URL}/en/about/members/airline-list`;

    /**
     * The base URL for airline codes search
     * @type {String}
     */
    AIRLINE_CODES_URL = `${this.BASE_URL}/AirlineMembersSearchBlock/Search`;

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
     * @param {string} url which page to get the data from
     *
     * @returns {Promise<URLSearchParams>} promise
     */
    async #getAdditionalData(form, url) {
        form = form[0].toUpperCase() + form.slice(1); // IATA form has 'Airport' and 'Airline'

        const res = await this.#request({
            method: "GET",
            url: url,
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

        const additional = await this.#getAdditionalData("airport", this.SEARCH_PORTAL_URL);

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
     * @param {string} [search = ""] query for the search
     * @param {Array} [regionFilters = []] filters for the search
     * @example client.airline("KL")
     * @example client.airline("KLM", [client.FILTERS.EUROPE])
     * @example client.airline("074")
     * @example client.airline("", [client.FILTERS.EUROPE, client.FILTERS.THE_AMERICAS])
     * @return {Promise<Object>}
     */
    async airline(search = "", regionFilters = []) {
        const url = new URL(this.AIRLINE_CODES_URL);
        const params = new URLSearchParams({
            search: search,
            ordering: "Relevance",
        });

        regionFilters.forEach((r) => params.append("region", r));

        const additional = await this.#getAdditionalData("airline", this.MEMBERS_PORTAL_URL);

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
                const headers = ["airline", "iataCode", "airlineCode", "icaoCode", "country"];

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
     * Airlines list. (Can be slow)
     * @param {Array} [regionFilters = []] filters for the search
     * @example client.airlines([client.FILTERS.EUROPE, client.FILTERS.THE_AMERICAS])
     * @return {Promise<Object>}
     */
    async airlines(regionFilters = []) {
        const additional = await this.#getAdditionalData("airline", this.MEMBERS_PORTAL_URL);

        if (additional.ok) {
            let max = 1;
            let data = [];

            for (let i = 0; i < max; i++) {
                const url = new URL(this.AIRLINE_CODES_URL);
                const params = new URLSearchParams({
                    page: i + 1,
                    ordering: "Alphabetical",
                });

                regionFilters.forEach((r) => params.append("region", r));

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
                    const headers = ["airline", "iataCode", "airlineCode", "icaoCode", "country"];

                    data = data.concat(
                        $("table.datatable tbody")
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
                            .get()
                    );

                    if (i === 0) {
                        const paginationElems = $("div.pagination").first().children("a");
                        // 2 ... 31 Next
                        // We want to get the value of "31"
                        max = Number($(paginationElems[paginationElems.length - 2]).text());
                    }
                } else {
                    return {
                        ok: false,
                        err: "Invalid response from IATA website! Returned partial results!",
                        result: data,
                    };
                }
            }

            return {
                ok: true,
                result: data,
            };
        } else {
            return {
                ok: false,
                err: "Invalid form data from IATA website!",
            };
        }
    }
}

module.exports = { Client };
