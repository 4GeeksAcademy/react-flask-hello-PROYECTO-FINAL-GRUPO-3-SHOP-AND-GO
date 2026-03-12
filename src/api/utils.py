from flask import jsonify, url_for
import os
import requests, math
print("API KEY:", os.getenv("GEOAPIFY_API_KEY"))
class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)



                

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""+links_html+"</ul></div>"


def geoapify_forward_geocode(street, city, postal_code):
    api_key = os.getenv("GEOAPIFY_API_KEY")

    text = f"{street}, {city}, {postal_code}"

    url = "https://api.geoapify.com/v1/geocode/search"
    params = {
        "text": text,
        "format": "json",
        "apiKey": api_key
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = data.get("results", [])

    if not results:
        return None

    first = results[0]

    return {
        "lat": first.get("lat"),
        "lon": first.get("lon"),
        "formatted": first.get("formatted")
    }

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def calculate_order_price(distance_km):
    base_price = 3
    price_per_km = 1.2

    total_price = base_price + (distance_km * price_per_km)

    return round(total_price, 2)