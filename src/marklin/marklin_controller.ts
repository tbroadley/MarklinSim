import { Train } from '../model/train';
import { MarklinIO } from './marklin_io';
import * as config from '../config';
import { ITickPayload } from '../util/tick_payload';
import { Track } from '../model/track';
import { StraightTrack } from '../model/straight_track';
import { BezierTrack } from '../model/bezier_track';
import { SwitchDirection, Switch } from '../model/switch';

export class MarklinController {
    private readonly trains: Map<number, Train> = new Map<number, Train>();
    private readonly tracks: Map<number, Track> = new Map<number, Track>();
    private io: MarklinIO = null;
    private readonly launchTime: number = new Date().getTime();

    public setIO(io: MarklinIO) {
        this.io = io;
    }

    public registerTrain(train: Train) {
        if (this.trains.has(train.id)) {
            console.warn(`Adding duplicate train: ${train.id}.`);
        }
        this.trains.set(train.id, train);
    }

    public registerTrack(track: Track) {
        if (this.tracks.has(track.id)) {
            console.warn(`Adding duplicate track: ${track.id}`);
        }
        this.tracks.set(track.id, track);
    }

    public setTrainSpeed(id: number, speed: number, light: boolean) {
        if (!this.trains.has(id)) {
            console.warn(`Setting train speed for train out of track: ${id}.`);
            return;
        }
        const train = this.trains.get(id);
        train.targetSpeed = speed;
        if (train.light !== light) {
            train.lightDirty = true;
        }
        train.light = light;
    }

    public reverseTrain(id: number) {
        if (!this.trains.has(id)) {
            console.warn(`Setting train speed for train out of track: ${id}.`);
            return;
        }
        const train = this.trains.get(id);
        train.reverse();
    }

    public changeSwitchDirection(id: number, direction: SwitchDirection) {
        if (!this.tracks.has(id)) {
            console.warn(`Setting train speed for train out of track: ${id}.`);
            return;
        }
        const swytch = this.tracks.get(id) as Switch;
        if (!swytch) {
            console.warn(`Setting train speed for train out of track: ${id}.`);
            return;
        }
        swytch.changeDirection(direction);
    }

    public tick(interval: number) {
        for (const train of this.trains.values()) {
            // Change speed
            train.accelerate(interval);

            // Change position
            train.move(interval);
        }
    }

    public getTick(delta: boolean) {
        const payload: ITickPayload = {
            time: new Date().getTime() - this.launchTime,
            trains: [],
            objectChanged: !delta,
            drawTrack: !delta,
            straightTracks: delta ? null : [],
            bezierTracks: delta ? null : []
        };

        // Put train info
        for (const train of this.getTrains()) {
            if (!delta || train.positionDirty || train.lightDirty) {
                payload.trains.push(train.serialize(delta));
                train.positionDirty = false;
                train.lightDirty = false;
            }
        }

        // Put track info
        if (!delta) {
            for (const track of this.getTracks()) {
                if (track instanceof StraightTrack) {
                    payload.straightTracks.push(track.getControlPoints());
                } else if (track instanceof BezierTrack) {
                    payload.bezierTracks.push(track.getControlPoints());
                }
            }
        }

        return payload;
    }

    public getTrains() {
        return this.trains.values();
    }

    public getTracks() {
        return this.tracks.values();
    }
}
