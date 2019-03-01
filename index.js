/**
 * Copyright 2019 GeoSpark Development Team
 * Copyright 2017 Volume Integration
 * Copyright 2017 Tom Grant
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
import Visualization from 'zeppelin-vis'
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector'


import L from 'leaflet/dist/leaflet'
import 'leaflet/dist/leaflet.css'
// workaround https://github.com/Leaflet/Leaflet/issues/4968
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  tooltipAnchor: [12, -28],
  shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

export default class LeafletMap extends Visualization {

  constructor(targetEl, config) {
    super(targetEl, config);

    const columnSpec = [
      { name: 'mapimage'},
      { name: 'boundary'}
    ];

    this.transformation = new ColumnselectorTransformation(config, columnSpec);
    this.chartInstance = L.map(this.getChartElementId());
  }

  getTransformation() {
    return this.transformation;
  }

  showChart() {
    super.setConfig(config);
    this.transformation.setConfig(config);
    if(!this.chartInstance) {
      this.chartInstance = L.map(this.getChartElementId());
    }
    return this.chartInstance;
  };

  getChartElementId() {
    return this.targetEl[0].id
  };

  getChartElement() {
    return document.getElementById(this.getChartElementId());
  };

  clearChart() {
    if (this.chartInstance) {
      this.chartInstance.off();
      this.chartInstance.remove();
      this.chartInstance = null;
    }
  };

  showError(error) {
    this.clearChart();
    this.getChartElement().innerHTML = `
        <div style="margin-top: 60px; text-align: center; font-weight: 100">
            <span style="font-size:30px;">
                ${error.message}
            </span>
        </div>`
  }

  drawMapChart(chartDataModel) {

    const map = this.showChart();
    // const markers = chartDataModel.rows.map(
    //   row => {
    //     const {latLng, tooltip, popup}= row;
    //     const marker = L.marker(latLng);
    //     const mapMarker = marker.addTo(map);
    //     if (tooltip && tooltip !== '') {
    //       mapMarker.bindTooltip(tooltip);
    //     }

    //     if (popup && popup !== '') {
    //       mapMarker.bindPopup(popup);
    //     }

    //     return marker
    //   }
    // );

    // let featureGroup = L.featureGroup(markers);
    // const bounds = featureGroup.getBounds().pad(0.5);

    //map.fitBounds(bounds);
    // map.fitWorld().zoomIn();
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    this.getChartElement().style.height = this.targetEl.height();
    map.invalidateSize(true)

    const images = chartDataModel.rows.map(
      row => {const {image, boundary}= row;
      // throw new Error(image);
      var imageUrl = 'data:image/png;base64,'+image;
      // var imageUrl = 'data:image/png;base64,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';
      // var imageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAlgCWAAD/2wBDAAMCAgMCAgMDAgMDAwMDBAcFBAQEBAkGBwUHCgkLCwoJCgoMDREODAwQDAoKDhQPEBESExMTCw4UFhQSFhESExL/2wBDAQMDAwQEBAgFBQgSDAoMEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhL/wAARCAB/AKIDASIAAhEBAxEB/8QAHQAAAgIDAQEBAAAAAAAAAAAABQYEBwACAwgBCf/EAEQQAAICAQMDAwIFAQUEBQ0AAAECAwQFBhESABMhByIxFEEIFSMyUUIkM1JhcRYlQ4EXcpGj0zVEYmRzgoSSk6Gx0dL/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAcEQEBAQEAAwEBAAAAAAAAAAAAAREhEjFRAkH/2gAMAwEAAhEDEQA/AP0e1JfvRajnir37UMEVGFxBCY1CkvJyclh/6KjyQvjYlSd+kPX2qNaac/K81py+LtCxZ+isYa8RAsqE7CzHZWFnilMhEaxyKyNuP2nd+njVcM9jPTwUZf7Vbr1oq8RbjxPKYtMHHuQovnceDuFIPIdR8Fmxi9QTY29SdOHZrVg/FZI4h4j9g8MC3I8kP2O4ATfrHqgXpn1Oxesop8fhstl6mp67GKXCZAwx2YXDcWY8VKyRAg7yxM6eCA2/jordXPGytOjmri2hJxBdIWV/b/V+n48bytt+3eNRvyO6Rf8AR7T+ocSua0W8TULck2UxuPoTmAPOIyYpKk3h6sjMAXaPbcEg+OhOiPWfK6SyVqn6pwXMo2PjaKzkYaPG9QjU7g2asfISIQVYz1+W247kcYXmdi1ZLd5L1fHrfzAvoO7ahY12PZG4LRntgPybYAeDsG8AjY75m7Yq46vPhs5cnlktRRskwhXihdVkLDtgrxDAnfz8D5I6CYPXWndb2nqVMnWsTWJhcmnjl2SSsi8o2rSD+8j8Ec0PnjIw8eejMmNtyYPIWbMDWpsrVKxy8f166AEwqwA9224JI87k+DtuAYYcPaWNRLmMlI4A5NxhG52/gR+Ohmre5g9O5HIvncvUWpWdjLDWhnKnbYNwMfnY7HyQP5IG5BvCZaHO4ilkKTpJBdrpMjo24IZQfB/59SLVWG9WlrXIY7FedCksUqBkkUjYqwPggjxsegov0Y9YMtry6MJrC3Jh83XrRxMIZ68htXEj52OCiIqIyhjmQhm5JICCdvBfH65zcOb1HhslmC93FaiSpC8ldIVarOkUkKqe0VeYLIVC7+4rv48nqjPUjB5P009RrWWkytyGevdr2YrksKOsldWH0zrHsqqiv/ZZQvHjHOje1Yj1Y9XVV3UescrlMYjYqbOPRq06UqyTSTPBAGkkIQ9uPkLTIhd9iYVbzuB0Fm6PyWdzOOw1zOXshSOYE+0IirgxcTvED+mfJjVyRv4J28bdFMlJkK1q39PmLn0+OhjksFo4CWJYsVH6fzwXYf8AtAft11vywQYmlXqxTVZsbLC1ZLEbRq3AgFee3Eck5Lvv/V0maw1RDi9KtnKtiWOxlbzSwRux4zkOsUCMhDbksIgAo3PkDoI9HU2sMj6wVdJPZsUqOLoyZDI25IYHe7C0aRxBNk2QGw8hB+SK7qQPkivUr1LzWnsrh8fiM9NVkyOTss8ktavL26FUdqViOHhnsOgX7cVbyNj1J9A4Z6dDPamy0mQygyd446telnaeU0qBaJWYN7iGna5INvs42AGw6qi/icH62+pdGhjrf1VbJUZMbaMD81+mWeazdk5DfYfrrWU/dpCfsOrB6F9KXzmqvTrT+a1JnLxv5eittuxDBGnCUl49l7Z22jZB/wBvTUcFZ3H++8vsPt+h5/7rojTggp1oq9OOOCCBFSOKNQqxqBsqgDwAAAAOu2/UAY4Cy2/+/cwCf47Hj/uus/ILAO/55mBv/nD/AOH0Z6z79ABk0zak+NRZ1PP9LQf+F1Ay2Ov4avUsV83l7DnI1I2ScwsrI86I4IEY8cWPx01hdgQvgfPQLWu/5TU4gE/m+O/q4/8AncXUoPj4G56zr5sf5PWdAmZ6SbH6ns36g5SrTrQKF9xbk8pCcP6gSB5Uhhtv5AI64xXIcQJ8znGSTsz8CY2Hmw5VH7e+24QcYV28+G/nrbUVtqGqbViue5OtKCNFI3+m5GbecL/UQN/HzxU7bDlv0goYvVOHjoLKs2Otqr0Wh4uTBGy/qh9vBd/Ib5Pgjzv1JgV/T+7h/wDZGrX0rXGHu4PHrHBBGUPsLMeCxIzK6+Dtt9/AI2O0zUmEwOu5MXJ6gUXaziJy9G9j7UsYjYuqFvYQygupUE7jZSwIHUvROnMdjNKWL0d6eq9xZBLdkdOcJWR1DhuICgfxtt/PkkmfoxPzS0ZZohAcaQjwAkiN+G0SjfyAIWD7fzOfuOtCv9R+kYtX6eo/TSSli7uQy7XBipWdcZfKKziRljPKCWTt+6aL9wfaRJR46ZK3rDBmUn0/laNzTGsliLT4bIEBzEB7568q+yxB9u5GTx5DmqMCoasxShXPY0YqX6O4bDPKI/KHeGXYunwSeJ8+D4+eoestLYnW+IGM9RsVFPAkokgu13dTWlH7Zo5V2kryDc+4Ebb7ciCegg6GojD42WCK4tO6lyXhHMNo5I2IkiVk+OXCRdyCDvv8gbdNGB1TXzQSOSN6lpkDiGT+tSNwyN8MOJDbfIDDcDfqiZshrPTNt8Zaik17h8jFDdiuRSRV8okQLxp3I24wWWCCJy6tCx2X2MdyZOkPVnCZXX6YSBr+mr7SNNBVyDfTSSR8FkZTVnCuDxWKMCMEFRuDs3hgJfiYhr6jwRw8lWe1asO1WCCqkpksxtBJJdjLRkMifTLtzHw7oNiSAVr0CpQR5unWzdPIxZ/SFV4LdYssqtE+3094Rpvxknj2EhUneSuylV7YAk0dRpksxmNaZyKpkocXPYxdSvAZnNqrwd7YigXkZLEkkZXhxO8UCEH79LuHsXPTxMb6kSs12ShC41QYwzPbxUzh5ZNyN3evMwlBI5lEkX5bq7wejsvranSx96SmyyWK8Z7KH4lk47qvjyDv8g7HYE7bdec/WnVWV/2vxOmtMFYbuCqxyR5GSAduCaOGV5bC9wcGaJVYqSSolkiDg/Bs3LZSDJQsclSL+XvPIp7iStIR2VEqeVBVoEBPHw7f4eq99RKtjJ+ommMdcBsYzS1GxnYryNyt14xF2CjSIVZo5pjJIUWRuf0y777bCCDnNa6k0jo/C6QwGMs4Vn7OGp1HtV5uxDDVka3JK0bsSQBFt3OBYy7nbc8bD/DDoSvjNOPqRYJETJ14qmGMykOmMhUCNgCBx7zhptvurR7/AAAKrxun19Y/WCvWtSM2IR56symwSwq0hGl1Ch8o89iZYWB2IjEmw8g9ewo40jVUiVVVFAVV8AD7AD+OtW8MeX/xcWfUDG+o3p3kPRTJ5Nc3hcXms1Np6O1ItXUsNNqXKjLGDxLvHPMI3I3V+Pn+Ej0E/GIk+HwmJ0vprWutGz9u3mrF+1blmfG4+9m7dakrmQOeMSQgOCyKiR7Lzb2devr2icDkdV4vU2QxNKfP4aCavjsjJEDNVjl2EqI3yA2w3H32H8dJGvvTr090ZpW1qyzoDAZSbQ1O7laEMWNgEyPze1KIGcBVZ5uUnkgdw8vB89TRUulfx643U+ZjwM2k7OKz1ZLLZitdyaxQY005rKZFGsGMIzVo4IZXHgcbUWx/nXE/jivZ7E4NsD6a5C9nMzqaPT6YsZqODjNNi1yVaVZJYkDRPAx3Yhdiu681Kk2X6Oal0D6z0cxnNK6SoV1gszV7L28fAszz3a8Et6KVACySc+EM6P5LwedwFPWnozob0y136f6N1jpj060/gYrKQZjFQHGwLNSlCFIpOUY27ioeIYE7KeIO3Tgqz8Efrxc1gLegLS5DKXtPWc1cyeUy+WkaeOJs1dhqwwpKpeyipEqmVX4R+1CeXtHp3V/L8sq9teX+9KHLY7bD6qLc9AtOeh2gNH5qll9LaO09ispjop4qtupRSOWFJ3LzKrDyA7szMPuSSfPRjW5b8oqGMNsMvjuRUb7D6yLf/wDX/PrP66GJdgo8/b79Z1m3WdMQhajrNZ1VcjhfhNYr1IIVaF3VmZpiTyB2HFQz7fcqN99gOjOmqMNcy5Cs5ir3X4xwHYLwVgkbDfyCQCdh4JffbfoJqdRDqXI2p41VIqNaGGysoR4pZXkUsTuCFVdz8n5PjqLkYL8eRlkwEgn+ggSKtXuI0YkZdhGGIG4/UdNjx+ITvuD1mVXL0Z1HHb9F8PlGZXa1Ts2Y0b5cd6Q/H/NR/wA+mexipcJSpz0bPavFo4J2ZA62XkkHJmH8hmdgQfuR8dJ+m9N1NF4nTulsIIqS4yKDH16tpuKzwQqJJGDAn3O4B8bnz5G3wd1jmp2FOpZEuJsl2kilDo6tJtwTY+RsC5c8lHiM9bHF8tLWytK1LJUsmzYltFeXZkMIUwRcQdwd+XL5Hgk9S8rqPlipfp7TQLfb6eNb0JhCM52PGUDj7QWOx3Pt6BZKWSZ3jWKnlaMAWCMxEKSkYK/tYlSTvP8A1Dyo8daZ8xwLj8PWty1X4B7EFwEoXYnkVVvO2wkPtbbyOgD5SXDLkYMnZmfCVwJvqJAyoj15R2l4HYoeKKGP3I57eVO2Z/EQahrTVNa4qjm6U7FpIJYEmAZ+THaOTcbgtw3VtxwUjrMXIakkzh6UVuBnZqTjuQyJIvs3iIHFeMhjAU+AZCSxLHoRSklwghr3S9CAziOpcSQPHI2wJSQEfuAK7MwHLcDctvuCToDSX5B6YaUOidT6t022QwkEKUr9B8jWa19Jzf2SfqQEcZFJhlj2YELttt0doar1NpajFX1ho5stQCmOS/pif64yJGPeZKcwSccjyBCd48kbfrPSzF2Mhcw9KlXg/K9I5rPRyyfUyqYXNiwkAQMhWQASSK/F9439p8AbsGOnkjMliHNtZh3KJFkava4MJGldQSFYe5oxsS+/JyPHgUVj6P8AqFj9OeqeH0hS1Tjb2nZIZBjKd95ILNNKpeQVJoXRZUni7jdoSACSBF+HiPOP6TkZ8aq1BPJLakl1Rjq5tBzzSjEkE7oRuRsrzyFlO+/uYjdturD1/jq+X0BqTHZ2jckaPGWrjEMrGCxFVMkUiMrEq8UixlWGxBQHx0veigWxFNm7UOPrxX9RwWbc8c30iBkgqxSP20URgGRJDt4Hk9QTfwq2b9/1A1BYtR1pEOKUWbfsd5H+qkEfF1A3X2z7hi22ybEDx16hlljrwvLMyxxxqWd2OwUAbknryl+FnLpNX1hqWpdhoSsa+9Gy4lWSIJLZcoqhWVe5YfbblsVYe77WHjvVCTKTjGakW3EJ2V7XBROoSPdpFHD3e7iq8eO5Dn526C159U42vqKDCT2O3kbNRrcKMhCvGHVDs37eXJh7d9/vt0B1Vf07rXRWrsXl5J58YlW5Ry0UZlikMaxkTBTH+ptsSOSAn/D56Hatr+nutloya0wuLyhuJ2as+UxWzJGymQlZJFBRdl5EqR9vv0Lj9GvRy5BGkGnNFycCWEsSxdxt/neQHkwPjwSR8f5dBX+mdPpJfnl1bprGaWoepNkLk7uA1leDT3WriTu8EEYinP0sP626sQCG2LbNcHp/U0jomZtGaJmkj+ipxXUo/UzWY6tfYQII2csqLvD/AHakeeTbbsSRDehHpGbf1J0bosPw4lVpQhGAG3lB7SdvuRv1ByPov6L2JY0taa0LBJECFWJIa58/yEK7/wDPoGs+sGjl1sNIyZyvHqN5RElGSKRGdyrMFVivFjsjnwf6T0T1qdsPAXAdDlMf8j4P1kOx6G6WOidD4aDD6UtYDGY6FneKrDdQAM7cmPliSSST1z1drHAT1KNKPL4x7VrLUErwmyvKVxbiOyDf3HYE7D+OpQ79Z1oZUB2LLuP8+s6bAo5TT1XVGpcjSzVaO1jRTrPLDJvtJJyk4fH+HYn/AFI6RYNHUWrPNa9JnhtMqGSNb8Lkq8jLJswk8sIwG+25O2/gHo9rvX93081DdyB05ezeE+hha9NjZ0a1WYGQLtA/ESKd/lX5DY+wgE9AJ/Xy0ckEpaX1LxlhWSCCeGls68igPd+rC7mQMpG54hP2+ek9GPjaahyzXZhoG09GxYaaaCxYqkpZO5mkcFzyYlYwW5cgF2HwR1xGPs6mmq07kJyzXjOkU1iBXhaNot14vzYxIqyOm+xMhDeAvk/cZ+IPALpgrkMdn8RRkeSi2YtJBPXW6ylikjVppnQksW5MgXY779HdNV68tWpmMRarTRZB69alPhmjkjaJBykkUxlhICicBvy2A8Ab7dB0zlxZ7dAYzHvRlr81nlEkavIBuidtgCJTzjI4tx/xHYDyEnyV3KW7i32gntSOIBXuRiIyMU3YIRuHCqNuQXbyT8bE62rNVMxNIbM9iCCSOvXM1eJj2UEkUvEqRJGR3Q0sxHFFZfgs3S5qGpNZgpwXcHi7kQrfqz2LPYRJP0+0sbsshEfGNCQ48+N9/PVE3KY2ShPEXoyVYJ0HcrW1kMRePzHxlQsItg0nu2H7gSPG41tZw1MZetRmLIUqNGWeOvYQSmdApYcJF9kwaQhypO/DkCRt0Dx2Bpw3hYyumsBUpZBJ0OTozqXjEsJBYyQxqAWV2G+6+Rvv426YMLYqYe2RPZikqzM5ey8gEdsCMFI+Y8FlXuuRJurE+0b+3oF7QtLCWKMkOjc2MlUws/01ylK6ydu7XlLStyHvVxMJZSCzpzL7fYludcrjjkfzKrXms01+uERmSC0JpYnGxWVGjmAbkvJZD4AA+NhXGa0ZLjL+Eymmh9FYLwO3kRSV6zt/cMx3jnYALwEixOCo97jgA53NXJqBqV6tZyN2C7GFrQNEJzGizLMGdR75UU7Q+fdzEittv4tnwfJ7tGqbF3PYydosNhrth6klOHnZrQFgFEYQOxZUcEgSKSRuNukvR+EoaG9EWq1J8dDnk0/PlKqxWd46s16tZn2iXb2Ik8qhH4+F47EgAB9xNOaxCrwwfW4uQNGsVQi3BYSuocxtEVI4NIQCw3O7n3AdU1iMjcz/AKNal0l6W4d8pPpM5jBJkVljoY+VY5SIHVt2eY8DWG6RkkH+9G+/UD/+GWbG2/RXMNhhXtpk81II68cSkiBFGylNzsO3Gyfx4/z26M17mNwGVabIS4/Ez17cBVJLy81hCyRyfprISDt7yFU+Nj1WXo9oTUGrfQLREtjUGChwupppvqDicA4nh2lsyKomltbFSw2IMXnYAr48kMP6UaagqZCKdM3fsUsZPPJHPbatEzxy7LII6pi5KfIBbkAQw+QerYSHtPUXFaNxGn9R5awMriSkqY/tScy6L315FpigQcoYdi3wWA6cq/rnoPUVSu+PqXNQ3bFdZmp4nAT5J08DcM8cRjGxIG5YD4/npCp6P03gcvYfB6bxWNsvcjUX6+J70r80UuCWDOT2pZ23Lee348gdW7oHHVYrUEkiKZZ8XVuVmDMFCyQrHKFXfYeYlJ/6/UFR538QtCHM2sXpv0hy1/IU5hBZju1a8LRyMCVBjhE8uxA334BfI3I3HXO1qv1Pymm3vfl+i/TlTfSCCpfxamxZiKcuUUs80cYbkQvF4t/nx8demRGFY7DY/O4Xbc9Ut+Ju1FkMDpzTxjxIgz+ooKt/KXxG64av25GlnUE7pIUV4lfwFMh3YeAQUovQb1c1RWZdbepdmpyAUQY2Z4I9jvy3WqtfyPG3k/PnfbzYLeiejtGYbGXKOncMc3WyWMLZV6vestILUIZxNKWkG+5/q38/fpi/6WNDYSnDG+qMMIo41RHFxZNwBxHld9z42/16Rc1+KD0t1PmcbpPTmscZldQXc1j44aVFJZzyFyLcMyoVQeD5Ygb+PnqC8dus6zb/ADPWdMRX+sCv5jlQyGxJNVgrV4QgcAyiRXcqfBPE8Rv43fY7ct+laLSmNsZJaljC494jZMMRaGJ+yrSBG2UjYeQznjvuTuerIhox29V3pJSS1ZKzKNh59snj/t2P+oHRqOpXhY9qKJGJ5e1QDv8Az0xVWa805grFqniMbj4KUVJpLMrUd6zxsUBLAp8hVCsfBG/aB4779V1j/S7L4DOQZTGahiwi2YUZspHJ9Pk2mZAN54WQV7Q+d2lRm232cHz1fepMVUs9misMPdy1gJJ7QCIwe5K3+pC7b/yw/wAuqkrZXWV3XGra+rMjQlwUFqU0qsohdUQMRGIghDhfp3JkMu5Eg9o4g9U0rZLUOo9HUXh1bpajqOlA/KfNYupM8DwMGLd+sjNLDK0uxZ1E0ZA33U+A2aP13jPUDv2dPMGjRRIjQOtiPgxCrxdCRupOxUnkOJ3HRS4zXEOSp0K0NXLvGsAxN5eMwTyH/pVt3Oy7ciSSOlXUmgNLZd5Z9T4bDT3S/M3b2LRLLMIwB/aYwj7bHf8AefK/J6DTUmqcThMrLBbtRY6XyXk2kqON9i20oBjcjlsFcD93ydjtzgtVc9i8imEt07Vq/RdG4N9LM5njJT3J7JF2EbA7bHgdj1DxvpFp2zHLIcbk7680iievqvISbHc/HKx4/u+Phv8AidRLugLOi4JW0FlbsNO2frGwOphLeq3PciI8dg8pYHCE7MGkX9P+7O+/WufwWDaXJLHbzVPHWsNYirvLBNw5VDKqBYjKvkLHzEbs48BQ5LAdVnonDwY6hXxiyWZshDXgM9ZVMtqCRou4ZGjG/d3Jkk7saOrFAyybEdAfU3Uuqp4qsXqnJltG6RqWJJhZhrrksbShEJjMdh433ng3DhhYhUjfwBsGAzTWtqtGbG4zTVmf1Px+PE7z1MRSnyFKjNuklVqdq5II4G7LtzjM/gGMRqAfLOCx9W6rzeEtx/7KtCMnnKAxNC5Vf3VbDsVWR4izOVT9RzyDAfTFQVKkdCvRPGY2bWWax3pxFZjxi4vFvXN0uYYL8AkXtg9wqXFQUzKpLElgVG2+1a5jMYDU2tlyEWSyWKk9OcRJenxWQMte5lMgk0ySxrJK6zyiBkaFVWSxF3LBAVgGBcNK6P1ZhNLYHIa5/wBoTq+N7OSy2XxVtZYYrszhZ+a11WYbHuLJvXaP2KqABUZMiL+HjLy1cjk/Thpa3PBamlyGnKssSTu2LnG+6huP92XUHdtyJkJAO/V7W/SC/b09NZt5KPGZCtBfWs9ehH3Y45Xd+JIcowI4EqQw8bfPnryz6o6oyXotrXTuutEzRZCtZSXGtPkLDSiexsWjS12uT9wKI5DFw5t9KoVQXA6vv0qzOutT6iwOM9QNX6b1lhNQ4qxloTiMV9Cpqxx1o0kbjK3KOSxNJxjYb8U9/uBRdXfYYdP6TtZq5KtLL2cnJFDSsi4K1etXVzDIu4YRsXIA22Tx58sD1tp/T2QzmpchjK+t8nBDp9BjcekSQr9R2kja38AOyo0lZNw/hlYHck7OGZ1e+jvRg52jFA1mhhozXSZSI+9xVED8diF5ld9tvG/kfPVV5fN0fS6jBmodR4ixa0DauRT1bd2KvYzVeZllyzlWfbu95TNGigbGDhvxk8ZAj1U1Toz09OQh9SsjrK5YhkarFFVl7c89lkDwCKLkeaSKJCJS3bUxMsnA7b05p7T3qL+JbBpj8XpXBY7StpO1YuV6MWPSyQd/1rjo80pDKp/syKu48sdgSWuW3/GJ+JCrFXpwHTGFjkanbUDty4TvLHLZLb7ySWpIjHGpHFIt2+Q3K5tS6nyGJuy5bJQ5jHYvKWSAmPl+irRNXRoyxYOrNyTgCT4/Q3CgdWqrrL/g91TlchjKWpNY4ZrWXaUT9+lczHZRE5PKjW7XHuklQCIwBzJ2G3TxhPwyZr01mwNyPXcdjFYzM40viqemK9NLAFuIBS6uWGxO+/n487nz190j6qY3VFqsMNlrNqaKWTszz5OVRVl7SmN2NpVXiVishuHLksnx8FXzKeo0mRbA4bJ39FSWr1+jMWxuZNgTcLtYERoVB5buD5J8A/x1mm1cfWda7f69Z1PJChltTVtL5jJWLsc0ol+nRUi2LEBJGZtiR4AH/wBwPv0xz0a+WrxNdqgnYMBINnjJH8jyCP8AI9V1q7ENmdemGnYaO3xrBOUYdEIDuG28b7FeZ8/8OMeNxu6arzKaa05NMZHV0jEccgRpWU7eXIALHioZz8+FPVlA2tFH9ZcufU5KKtG5p05QzTmPiwMrglW2BdQnu8fp/bfqtdRZKhlH3zlqnkMbLBevXObAPJDFE2yniwOzLMF4gAnh89R8t+JvA46quD0bi8nkLK1zFDGqF5T7BwIii5y+7ffcqv3J6A2chrXVkUBXSOFq455ZlD6gZYw6ofa4hQSzboCfDPESSQdth1VwOo+n1rCwVcZjMBpyCqIsfXiqvQ4OsqRqr8ykoV93eVVDACPtoSW3PFrlzeF0LSenctY7S+KjeRqFS4IYnljL80jjjWXk7EySeFQnx8dBodHX71xn13rLMGvYVy1HDt+V1ywYeOa9yz53f/ijfx4B6LV9P4HSE8OW0Tp3GUrgjllnlNN690vGCSZZ5A7+5SCGc+9STtsp6IAWNT5rUWGMvp3onOC1XkjZc3agjx0CuzqRxWcCxKW7QUbQH+88b9D6+J1jnaleDU3qC9eGCPY08DRh75jEpPmxb3ZxwMu3bjj2AG3wOrIGRZMUh2ylJ5OSwSR7S8nReyJOOzEElCiHiPJkf+kHqLXSGWl9LWv0bEQjEUVOWovAxovFQYyQ3lO6vjb4Hjq6Eat6f4XG6lFuTTUups7TkhEMuoJXvTTzAGSQI9ss0ezqTtGwG5Oy9LmJ9QaeJw+V1bPPcXOZu1k8/jMdPC8qzqLCwUYmZhsodoasYPMBt9gft00a/wBXWdB4rK3skZnlkp3J8dHSIjT6hIuQJiOyryVQo2BO52B3+astwDRmr46yTLfh9M8dWipmR9/7bDEmOq7nYrHGkpyE2+37oORIO28Ef1LtvpWzpz01l0le1y2Ligy2VqWIQ8FyGu06iZY2HeMkmTaaZxEp5RhAGbl44yYyjqEx3aeZggtUGkhrSWMxLmIIYmaOUxm2ezNVcPKQ0L2G2YcQPBPTb6e+jVRdFDO5HNWFkyNFbt3GZKrHPBbopKPoVjjdf05pQjzc0HtM7DiAdunbOaQxmev5OfUNfhboKBNmcfMUuDZQyp3h7mXm7yujmUFe2gQE+Are3ibgw8MPqJh62oWmLflMkuoZDMsw8AtWudkykKjBSLJfixaJg/HatsONTen2dyU3p9a1V6W/nlaSvdTOLB9Mqd6QIUyRVoZGUPzVva6mXcs3ybsOAyuiLv081eTVeBrqY7ww8YhtkbBh9VRXZZGjkcHu1wr8jusQHzAnzlHMYwQem85in1BlHxlTMVokCuqAmWw0SEPHLFEu/FlCs0sKOB/RdqwrXNV+s+T9LJ4NQXLNzQuShmx1yfFw4+eVICWgaNXBbd2YlgxcgrtuRvuAOpMbq/UWmbWmdY5XPPpdZWcwZ/tduWQukskpggJlslWeVjGAw5yRjzx6te/6K6CoVMfj461Kq8HD6bIULEYMqD/itIrLO7cmUg8m5btJuO4AJWO9L8bL2b+sLGq9X42i8xFezlPoeyjxxtKXsSIk7x7o7cTYKkRsSCVPTSKw9N6mptNXYMD6Svn7Vaysx1XlMPhe/c7yrE1ZZBHPD2FXnNCsTWCycNxEFYsft+jbz2Px8kWT17kctjsi86Qrg6KqgLyRl2D2ZWBAcDY7+4jwTt16x9Fqml/T/TRx9fK3qdSweEFDKOYIKaxjgI4eSqu/AryIJ5n3/wBXU7OehPpdFpu282mdN0avCSYXVqJvHIyFO9y/qfzuCdySf5PmGvJmsdC5ZK+GvVsXr+NYplMeVz0FLHJDkGhdnWtXrxJNM0gDoo5orGRRycgqLQ9KvQ/Tz4fS2qLmO1Rk9Q4jO11kz+rcnJYtl1vpH266RssKxHiG3VOG2wHMgst7aPpT6t09RiyEMeMxFCEVJMXX3RpJIf02WT7pGCviMeSNuR2PHpi1NClfD04oURIo8pj1REHEKotRAAAfAHU00wAjbrOvgA2HWdRnqgfV31Ks6L9RzSpZnDaYN6jEJM1mMHatxQIxICpKrJXRt15ESPvsoIVh1EwuksL6iYq1nNU6nyXqHFCghrwz5RGod59y3KrU4QsqoVDBw25Eg8+OrB1diYcjZ1bJKBKHxsVOSrL7knSaN14L4PF2LKoYA/bcHqtMh+HaK49WeKKvBdxUG09y5RMM9icyvJwikrPGzqFZQp3JXtxhSCXHSNGXE6Px+n8HDHWx1DDmxO3txINRHVBxZiqBRvyZF8g/sY7nl10givyoI61lrLRK6QQywiQnkWdwCvE+dpPPnx0kaf0lqhms1hq7JVBR/s1BZLS5RLFjltwEVmPuqnkjcTjYoQdiCA7zaC9QtPUbVtNT6IlaKtLs7aZthmZl23G17YHyQP8ArHqoGZrTlfL0Pp8lB+ZvDKz15Mfc4IzKXjB35KRuwc/Lbcxt9tuZWnpvHGrVeitGNYmWvZE0bTdv9UFyy/dVZdyzAhymwAPSlexnqZHxTGVtG346tFq8H0PcosWHN+925uas2yn5mX9ngjfzmG11qPF6hrxa/wATqHT+OdI5bOQs4uS1FEGfuJyMHfQIdpE3aVCPO426odvp444ppq0duFI3jrxSULK2Yv0/ZuEO+w3SI+F+Hb+T1zlvBoOE60bxjXuGKZTA6BQWJKyAjYN3QTuB56TL/qZpjLWIodL/AEeuLMcRsvDpiKSW1HCeX6krJukJ4rF/eyR+4/I4noV63X9Uy+lkNnK4elgDNeNPFU47P5nkbWQYSxR912Irxx9yTZ02n5Dc77joOfq7Hh6WL03ZvTxYiGzk6taKC+vGswaVbZbmvLkSlWSMKnItuAoLEdCPTX0ry13T9uz6t8qmIz7xW7GPqbxzXqiRcOdxzsYoigsyfTDbczjvHcmHqdq/QeE0U+BNaGfIaixmpMfDUzl+wzWrMXFjZiDyHeJFqvckIiVIo+EZAkPxYOhM6seAfVE5lxsmRBarWhczpLFIeSqinyOey7AKygIW4Iu/RRO9fshsfQw+Vj+ptP8Ams0LRENjEU8K7OmxCog2C+ODPHsEPkjIMrjEgpxyRQR4jHo1uVJQUSywYsg3G7Rux2lZlJVt0ZkTudS6+HyuKxq53KVK1jO6olM0MFHZOBEbNBXC/dEjB3YDkzPIfaX26Faex1a/lYUq3oOy4KtNKwiWzHAVeZzyVgec3AbEOOMWx226I+w1DZs1KV2B6k9dGsWo5HVv15i2y81J3UcnPIMQdl6r+PVeEoauo5uzRrY/M369lqear02e1PT3aCvHNJ2uQVmiDIX5nn2tmBbY2lNSepiDJNUno3s9MOyhUp7ptkjCjcjdY9j7GYgqf0x0u4fSkGOx/wBLpa7PBHbmM9b6qfZYK9VVjrRCTYKqluJCycG2d/B3PRYgRz1spgaFzEvHDUyKCfIS06p4uG3CPt+4KwAjCsx5AK3Ehn2Pw1pFVoJk/UoqktapYsgrOi7BS0oB3kDrsvEEI6RnZ/2ryjsRVoBM8MlTH3QyXMfMxMqNtwkZgWJWPwUlPIs4Ad3VNz10lx9mTK0cJW4HIbd/CvLt+muwVhIpG3HjuvKTzJGPaspReM0wQ07rL/ZgTZC8Wv4iyP7fsmwMaghWjg88AgUjixLlQw9ywh+iWqNM2KkmEzeLptQu2cmkVHDYmeOKNhJG4WWT2tG8sZ/VZuLBEVwoc+W3zXpqlPJYyrXtx25tRWjFlhIpf2BOcssaknbdE7bci3IujtzdR064RU1Fqi9mGHKliS+Nxvt9pYEfUyr48+4CIH7dp/8AEeqgfhtN6vwNuzkDksLl5L2zXKZpyUlkkHgSLIHkAbthUO6ANwU+3z111HqNrFbH08hjMpjbMuVx/EyQ9yIkWoyR3Y+SDwD+4rv8fPTwu3nj0F1aAMfV2G5OUo7j/wCJj6lBoAEdZ19HwP8ATrOp4hTGJ/MtX3GkcLDUmqWHj4790rHIEBP+TEN9/KjrvrW5JXx/08NN7cdhG5mOIyvCF8mQKPkj7bHfkV2B87SpqeRq5e3ax4ovFaSIFZ3dWUoGB+Ad99x0Hz+k72qLuJtX5oqsuFsmxAKllgrt4/cGQj7fPzsSN9mPU34IeDw0uLyUF69VmswY2PsxzIC0is6gsxHzKqqRGJNuZ95PLffqRqHCZHUFm1ZjrRyJCy1acM/t2Xmvcl2II8nyPAO0YIPnrifTybuRuly+TG8TDfN2PPbeV138eQTO4P8AICA/sXbtprQ82mbxs0ZpJZGh7JFrK2LChNx8K3tB8DyBv1dCxYrWcflJ6Zq20WQGtHAhicLC6rEH25F+e7Md9yOLftB+Gs3JzhtQ5jEVy8ksjxwq8hgYRQp2/wCoeCHEh2O3+vRuSrkJJkkeviCwblyPMsCBsCDt89aW6V6zTkqyw4pq06sk0TB9mVgeQ2H87nf/AFPTRUrT1Y8ekeVxtqCMQIbPOLlzHHvPyePfzxkddzt5jH8dV1m9Q2NSer2OwLmzJhvT+lXyeRMdxuNi0oZkTgR72e5InFjuf7K+xXcsfRN/Sd29aSYflEHE7uqRSfqe4Hz5/jmP/fPSNgvw+y4PNZ7JR5Svblz+bOUsG4k07jhGErQF2k3aOPZm+xLMTuPjq9Jio9Q4S7rXVs+GppLLSw8Jx0uSaN1rxZSyEnyEpkVWVWiriGMFm+JZQGYgqLDnxWdz9mKvkqdihjK9QChHLQ5BKhIXiCpLB3QHkAW7aFF3Xd+i2hvw+2NH2qVu1m483chWaW3NchdRaszTd6R+Kt7YzKWftkuAQux2BBtR486Vbtz4cMR7d4JSAdvv7/56Kqa5Hk1yZisxzwz8Uo4qvP5QvLsXkUb/ALd+HxuoETbk7+bH0x6fUtP1bFWdo8jVkhSCKKesmyQgsxQj4bd3dj4+4G3jqHNp7WN1oXyGoMGrQPzQVMKU7bcSpKtJJIQdiRuNvBPQJvTLVOQmLZ7WE+QhdBvXiaeonLkTv+nICRsVG2/2P87dTensW1xgsdRwrd3UMGDqwLI0YyNsdiJjGycgXYEbKzbDcqN/2npGjycdTKdnFwz5G3bhSDFw0o5JUarEqgkSgKvbBkJYBlGxX9NydumOv6MV6l2O1XixcVyJR27AltySKR/UOcrLv/mQT1PvaS1dNbpWINRYhrFIydt7WLZ5AGidNg6OngFw2xB3Kjp5AXpfSFvI3rctFVxVJJilieRY2ktWlbeWVYUBiTidkXcsAVY8C2zdWHU0ri6uOekKcM8Esgkm+pHeaeTwecjNuXbcDydz4HQ3F4vO4jH16dObCLDWjCJvBKSQPkk8/JPyT9yT1L7eoyPE+E/+hL//AH1diAevMRVxuIiOmK1XHaiszithbFeuqmOxICOTAAco1UM7qflYz9wCC+hpo48BFjRXWnYwoWnarqxZUdUU7qx/crKwcMfJDedjuBAs4DUFnUFbKyW8K70qzw14Wry8Y2kYF5P3+WKqqj+By/xHraHC6jr5e1kIbWCD3IIo5IuxMF5xl9n35/JD8T/1V6mhtB2G5/8Ax0C1iw/L6fx/5WoD5/8AWY+tZF1MoJWbA7bfeKb5/wDm6XJNDahv6wTMZLMxtX/sqtj0nmNaIQyiRnjiJ27jlUUsxOwXwBud50WIPgdZ1gB2HnrOtaP/2Q==';
      // imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
      var jsts = require("jsts");
      var reader = new jsts.io.WKTReader();
      var obj = reader.read(boundary).getEnvelopeInternal()
      // var imageBounds = [[24.863836, -126.790180], [50,-64.630926]];
      var imageBounds = [[obj.getMinY(), obj.getMinX()], [obj.getMaxY(), obj.getMaxX()]]
      L.imageOverlay(imageUrl, imageBounds).addTo(map);
      map.fitBounds(imageBounds);
      return image
      }
    );


  };

  createMapDataModel(data) {

    const getColumnIndex = (config, fieldName, isOptional) => {
      const fieldConf = config[fieldName];
      if(fieldConf instanceof Object) {
        return fieldConf.index
      } else if(isOptional) {
        return -1
      } else {
        throw {
          message: "Please set " + fieldName + " in Settings"
        }
      }
    };

    const config = this.getTransformation().config;
    const imageIdx = getColumnIndex(config, 'mapimage');
    const boundaryIdx = getColumnIndex(config, 'boundary');

    const rows = data.rows.map(tableRow => {
      const image = tableRow[imageIdx];
      const boundary = tableRow[boundaryIdx];
      // const latLng = L.latLng(lat, lng).wrap();
      // throw new Error(typeof(lat));
      // const popup = popupIdx < 0 ? null : tableRow[popupIdx];
      return {
        image, boundary
      };
    });

    return {
      rows
    };
  }

  render(data) {
    try {
      const mapDataModel = this.createMapDataModel(data);
      this.drawMapChart(mapDataModel)
    } catch (error) {
      console.error(error);
      this.showError(error)
    }
  }
}
