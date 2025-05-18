import {View, Grid, Heading} from "@aws-amplify/ui-react";
import MiniStatistics from "./MiniStatistics.tsx";
import { Eye, Telescope, ScanEye } from 'lucide-react';
import "./Dashboard.css";

const stats = [
    { title: "Page Views", amount: "321,236", icon: <Eye /> },
    { title: "Visits", amount: "251,607", icon: <Telescope /> },
    { title: "Unique Visitors", amount: "23,762", icon: <ScanEye /> },
  ];

const Dashboard = () => {
    return (
        <View padding="1rem">
            <Heading level={2}>Dashboard</Heading>
            <View borderRadius="6px" maxWidth="100%" padding="0rem" minHeight="100vh">
                <Grid
                    templateColumns={{ base: "1fr", large: "1fr 1fr 1fr" }}
                    templateRows={{ base: `repeat(${stats.length}, 10rem)`, large: "repeat(1, 8rem)" }}
                    gap="1rem"
                >
                    {stats.map((stat, index) => (
                        <View key={index}>
                        <MiniStatistics {...stat} />
                        </View>
                    ))}
                </Grid>
            </View>
        </View>
    );
};
export default Dashboard;