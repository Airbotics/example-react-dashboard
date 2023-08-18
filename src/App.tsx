import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Stage, Layer, Circle, Line } from 'react-konva';

/**
 * constants
 */
const API_KEY = process.env.REACT_APP_AIR_API_KEY || '';    // export REACT_APP_AIR_API_KEY as an environment variable first
const ROBOT_ID = 'robot0';                                  // NOTE: replace this with your robot id
const REFETCH_INTERVAL = 1000;                              // how often to poll in ms
const LINEAR_SPEED = 2.0;                                   // linear speed of cmd_vel command
const ANGULAR_SPEED = 2.0;                                  // angular speed of cmd_vel command
const COMMAND_INTERFACE = 'topic';                          // type of interface to send a command to
const COMMAND_NAME = '/turtle1/cmd_vel';                    // name of the topic to publish to
const COMMAND_TYPE = 'geometry_msgs/msg/Twist';             // msg type of the topic to publish to
const DATA_SOURCE = '/turtle1/pose';                        // name of the topic to query
const DIR_FORWARD = 'forward';
const DIR_BACKWARD = 'backward';
const DIR_RIGHT = 'right';
const DIR_LEFT = 'left';


/**
 * general card
 */
const GeneralCard = () => {

    const { status, data } = useQuery(['robot', ROBOT_ID, 'general'], async () => {
        const response = await fetch(`https://api.airbotics.io/robots/${ROBOT_ID}`, {
            method: 'GET',
            headers: {
                'air-api-key': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error();
        }
        return await response.json();
    }, {
        refetchInterval: REFETCH_INTERVAL
    });

    return (
        <div className='border border-slate-300 rounded-md p-5 bg-white'>
            <h2 className='font-semibold text-slate-700 font-sans text-lg mb-7'>General</h2>
            {status === 'loading' && <p className='italic text-slate-400'>Loading...</p>}
            {status === 'error' && <p className='italic text-amber-700'>An error occured...</p>}
            {status === 'success' && (
                <>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-slate-400'>ID</p>
                            <p className='font-bold text-3xl text-blue-500 mb-7'>{data.id}</p>
                        </div>
                        <div>
                            <p className='text-slate-400'>Name</p>
                            <p className='font-bold text-3xl text-blue-500 mb-7'>{data.name}</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-4 gap-4'>
                        <div>
                            <p className='text-slate-400'>CPU</p>
                            <p>
                                <span className='font-bold text-3xl text-blue-500'>{data.vitals.cpu}</span>
                                <span className='text-xl text-blue-500'>%</span>
                            </p>
                        </div>
                        <div>
                            <p className='text-slate-400'>Battery</p>
                            <p>
                                <span className='font-bold text-3xl text-blue-500'>{data.vitals.battery}</span>
                                <span className='text-xl text-blue-500'>%</span>
                            </p>
                        </div>
                        <div>
                            <p className='text-slate-400'>RAM</p>
                            <p>
                                <span className='font-bold text-3xl text-blue-500'>{data.vitals.ram}</span>
                                <span className='text-xl text-blue-500'>%</span>
                            </p>
                        </div>
                        <div>
                            <p className='text-slate-400'>Disk</p>
                            <p>
                                <span className='font-bold text-3xl text-blue-500'>{data.vitals.disk}</span>
                                <span className='text-xl text-blue-500'>%</span>
                            </p>
                        </div>

                        <div className='grid gap-4'>
                            <div>
                                <p className='text-slate-400'>Connection</p>
                                {
                                    data.online ?
                                        <span className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xl font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>Online</span>
                                        :
                                        <span className='inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xl font-medium text-red-700 ring-1 ring-inset ring-red-600/10'>Offline</span>
                                }
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    )
};


/**
 * commands card
 */
const CommandsCard = () => {

    const sendCommand = async (direction: string) => {

        let linearX = 0;
        let angularZ = 0;

        switch (direction) {
            case DIR_FORWARD:
                linearX = LINEAR_SPEED;
                angularZ = 0.0;
                break;

            case DIR_RIGHT:
                linearX = 0.0;
                angularZ = -ANGULAR_SPEED;
                break;

            case DIR_LEFT:
                linearX = 0.0;
                angularZ = ANGULAR_SPEED;
                break;

            case DIR_BACKWARD:
                linearX = -LINEAR_SPEED;
                angularZ = 0.0;
                break;

            default:
                linearX = 0.0;
                angularZ = 0.0;
                break;
        };

        const body = {
            interface: COMMAND_INTERFACE,
            name: COMMAND_NAME,
            type: COMMAND_TYPE,
            payload: {
                linear: {
                    x: linearX,
                    y: 0.0,
                    z: 0.0
                },
                angular: {
                    x: 0.0,
                    y: 0.0,
                    z: angularZ
                }
            }
        };

        const response = await fetch(`https://api.airbotics.io/robots/${ROBOT_ID}/commands`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'air-api-key': API_KEY
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error();
        }

    };

    const { mutate } = useMutation(sendCommand);

    const { status, data } = useQuery(['robot', ROBOT_ID, 'commands'], async () => {
        const response = await fetch(`https://api.airbotics.io/robots/${ROBOT_ID}/commands?limit=10`, {
            method: 'GET',
            headers: {
                'air-api-key': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error();
        }
        return await response.json();
    }, {
        refetchInterval: REFETCH_INTERVAL
    });

    return (
        <div className='col-span-2 border border-slate-300 rounded-md p-5 bg-white'>
            <h2 className='font-semibold text-slate-700 font-sans text-lg mb-7'>Commands</h2>

            <div className='flex pb-7 gap-4'>
                <button onClick={() => mutate(DIR_LEFT)} className='bg-blue-500 hover:bg-blue-600 border border-blue-700 text-white shadow-sm px-4 py-1 rounded cursor-pointer'>Left</button>
                <button onClick={() => mutate(DIR_FORWARD)} className='bg-blue-500 hover:bg-blue-600 border border-blue-700 text-white shadow-sm px-4 py-1 rounded cursor-pointer'>Forward</button>
                <button onClick={() => mutate(DIR_BACKWARD)} className='bg-blue-500 hover:bg-blue-600 border border-blue-700 text-white shadow-sm px-4 py-1 rounded cursor-pointer'>Backward</button>
                <button onClick={() => mutate(DIR_RIGHT)} className='bg-blue-500 hover:bg-blue-600 border border-blue-700 text-white shadow-sm px-4 py-1 rounded cursor-pointer'>Right</button>
            </div>

            {status === 'loading' && <p className='italic text-slate-400'>Loading...</p>}
            {status === 'error' && <p className='italic text-amber-700'>An error occured...</p>}
            {status === 'success' && data.length === 0 && <p className='italic text-slate-700'>No commands sent</p>}
            {status === 'success' && data.length !== 0 && (
                <table className='border-collapse border border-slate-400'>
                    <tbody>
                        <tr>
                            <th className='border border-slate-300 px-4 bg-slate-50 text-slate-700'>Time</th>
                            <th className='border border-slate-300 px-4 bg-slate-50 text-slate-700'>Name</th>
                            <th className='border border-slate-300 px-4 bg-slate-50 text-slate-700'>State</th>
                            <th className='border border-slate-300 px-4 bg-slate-50 text-slate-700'>Linear X</th>
                            <th className='border border-slate-300 px-4 bg-slate-50 text-slate-700'>Angular Z</th>
                        </tr>
                        {
                            data.map((command: any) => <tr key={command.uuid}>
                                <td className='border border-slate-300 px-4 text-slate-700'>{command.created_at}</td>
                                <td className='border border-slate-300 px-4 text-slate-700'>{command.name}</td>
                                <td className='border border-slate-300 px-4 text-slate-700'>{command.state}</td>
                                <td className='border border-slate-300 px-4 text-slate-700'>{command.payload.linear.x}</td>
                                <td className='border border-slate-300 px-4 text-slate-700'>{command.payload.angular.z}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            )}
        </div>
    )
};


/**
 * location card
 */
const LocationCard = () => {

    const [pose, setPose] = useState([0, 0, 0]);
    const DIR_POINTER_LENGTH = 20;
    const MAP_WIDTH = 330;
    const MAP_HEIGHT = 300;
    const MAP_MULTIPLIER = 30;

    const { status, data } = useQuery(['robot', ROBOT_ID, 'location'], async () => {
        const source = encodeURIComponent(DATA_SOURCE);
        const response = await fetch(`https://api.airbotics.io/robots/${ROBOT_ID}/data?source=${source}&offset=0&limit=20`, {
            method: 'GET',
            headers: {
                'air-api-key': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error();
        }

        const responseData = await response.json();

        setPose([responseData[0].payload.x * MAP_MULTIPLIER, MAP_HEIGHT - responseData[0].payload.y * MAP_MULTIPLIER, responseData[0].payload.theta]);

        const waypoints = [];
        for (const dataPoint of responseData) {
            waypoints.push(dataPoint.payload.x * MAP_MULTIPLIER);
            waypoints.push(MAP_HEIGHT - dataPoint.payload.y * MAP_MULTIPLIER);
        }

        return waypoints;

    }, {
        refetchInterval: REFETCH_INTERVAL
    });

    return (
        <div className='border border-slate-300 rounded-md p-5 bg-white'>
            <h2 className='font-semibold text-slate-700 font-sans text-lg mb-7'>Location</h2>
            {status === 'loading' && <p className='italic text-slate-400'>Loading...</p>}
            {status === 'error' && <p className='italic text-amber-700'>An error occured...</p>}
            {status === 'success' && (
                <Stage className='bg-slate-200 border border-slate-400' width={MAP_WIDTH} height={MAP_HEIGHT} style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
                    <Layer>
                        <Circle x={pose[0]} y={pose[1]} radius={4} fill='blue' />
                        <Line
                            x={0}
                            y={0}
                            points={data}
                            stroke='gray'
                        />
                        <Line
                            x={0}
                            y={0}
                            points={[pose[0], pose[1], pose[0] + DIR_POINTER_LENGTH * Math.cos(pose[2]), pose[1] + -DIR_POINTER_LENGTH * Math.sin(pose[2])]}
                            stroke='blue'
                        />
                    </Layer>
                </Stage>
            )}
        </div>
    )
};


/**
 * logs card
 */
const LogsCard = () => {

    const { status, data } = useQuery(['robot', ROBOT_ID, 'logs'], async () => {
        const response = await fetch(`https://api.airbotics.io/robots/${ROBOT_ID}/logs?limit=10`, {
            method: 'GET',
            headers: {
                'air-api-key': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error();
        }
        return await response.json();
    }, {
        refetchInterval: REFETCH_INTERVAL
    });

    return (
        <div className='col-span-2 border border-slate-300 rounded-md p-5 bg-white'>
            <h2 className='font-semibold text-slate-700 font-sans text-lg mb-7'>Most recent logs</h2>
            {status === 'loading' && <p className='italic text-slate-400'>Loading...</p>}
            {status === 'error' && <p className='italic text-amber-700'>An error occured...</p>}
            {status === 'success' && data.length === 0 && <p className='italic text-slate-700'>No logs collected</p>}
            {status === 'success' && data.length > 0 && (
                <table className='border-collapse border border-slate-400'>
                    <thead className='bg-slate-50 '>
                        <tr>
                            <th className='border border-slate-300 px-3'>Time</th>
                            <th className='border border-slate-300 px-3'>Level</th>
                            <th className='border border-slate-300 px-3'>Msg</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((log: any) => <tr key={log.uuid}>
                                <td className='border border-slate-300 px-3'>{log.stamp}</td>
                                <td className='border border-slate-300 px-3'>{log.level}</td>
                                <td className='border border-slate-300 px-3'>{log.msg}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            )}
        </div>
    )
};


/**
 * main app
 */
const App = () => {
    return (
        <div className='w-screen bg-slate-50 p-8'>
            <h2 className='font-semibold text-slate-700 font-sans text-2xl mb-7'>Acme Robotics Dashboard</h2>
            <div className='grid grid-cols-3 grid-rows-3 gap-8'>
                <GeneralCard />
                <CommandsCard />
                <LocationCard />
                <LogsCard />
            </div>
        </div>
    )
};


export default App;
