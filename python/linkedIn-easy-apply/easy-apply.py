import yaml

from classes.linkedinator.linkedinator import Linkedinator

if __name__ == '__main__':
    with open("./assets/config.yaml", 'r') as stream:
        try:
            parameters = yaml.safe_load(stream)
        except yaml.YAMLError as exc:
            raise exc

    assert len(parameters['positions']) > 0
    assert len(parameters['locations']) > 0
    assert parameters['username'] is not None
    assert parameters['password'] is not None

    print(parameters)

    output_filename = [f for f in parameters.get(
        'output_filename', ['output.csv']) if f != None]
    output_filename = output_filename[0] if len(
        output_filename) > 0 else 'output.csv'
    blacklist = parameters.get('blacklist', [])
    uploads = parameters.get('uploads', {})
    for key in uploads.keys():
        assert uploads[key] != None
    bot = Linkedinator(
        parameters['username'],
        parameters['password'],
        uploads=uploads,
        filename=output_filename,
        blacklist=blacklist
    )

    locations = [l for l in parameters['locations'] if l != None]
    positions = [p for p in parameters['positions'] if p != None]
    bot.start_apply(locations, positions)
